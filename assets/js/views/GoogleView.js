/**
 * @file
 * A Backbone View that provides the visual context for the Google map.
 */

(function (Drupal, Backbone, _, google, MarkerClusterer) {

  'use strict';

  Drupal.maps.GoogleView = Backbone.View.extend(/** @lends Drupal.maps.GoogleView# */{

    model: Drupal.maps.MapModel,

    /**
     * The Map object for this view.
     */
    map: null,

    /**
     * A local array for markers.
     *
     * @prop {array}
     */
    markers: [],

    /**
     * Renders the Google map view for the map model.
     *
     * @constructs
     *
     * @arguments Backbone.View
     */
    initialize: function() {
      this.listenTo(this.model, 'change:markers', this.drawMarkers);
      this.listenTo(this.model, 'markers:before', this.drawMap);
      this.listenTo(this.model, 'markers:before', this.loading);

      this.model.getMarkers();
    },

    loading: function() {
      this.$el.before('<div class="loading-container"><div class="spinner"></div> fetching markers...</p>');
    },

    /**
     * Render the map.
     */
    drawMap: function() {
      var mapSettings = this.model.get('map');
      this.map = new google.maps.Map(this.$el.get(0), {
        zoom: mapSettings.zoom,
        center: { lat: mapSettings.center[0], lng: mapSettings.center[1] }
      });
    },

    /**
     * @inheritdoc
     *
     * @returns {Drupal.maps.GoogleView}
     *   The current map view.
     */
    drawMarkers: function() {
      this.$el.parent().find('.loading-container').remove();
      this.markers = [];

      _.each(this.model.get('markers'), function (store) {
        var position = new google.maps.LatLng(store.get('lat'), store.get('lng'));
        var marker = new google.maps.Marker({
          position: position,
          map: this.map,
          title: store.get('title')
        });

        // Add the MarkerModel instance to the marker for reference.
        marker.__m = store;

        google.maps.event.addListener(marker, 'click', _.bind(this.onClick, this, marker));
        google.maps.event.addListener(marker, 'mouseover', _.bind(this.onHover, this, marker));
        google.maps.event.addListener(marker, 'mouseout', _.bind(this.onHoverOut, this, marker));

        this.markers.push(marker);
      }, this);

      if (this.model.get('cluster')) {
        new MarkerClusterer(this.map, this.markers, {
          imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
        });
      }

      return this;
    },

    /**
     * Click handler for a particular marker object.
     *
     * JIT creation of the marker description box. If the model is configured
     * to load the description via AJAX this will trigger a request to the URL
     * for the marker to get the information.
     *
     * @param {object} marker
     *   A Google maps marker object.
     */
    onClick: function(marker) {
      // Close an open tooltip.
      if (marker._tooltip) {
        marker._tooltip.close();
      }

      // If we have opened a popup before we should close it.
      if (this.model.has('open')) {
        this.model.get('open').__popup.close();
      }

      // If we have created the info window before open it.
      if (marker.__popup) {
        this.model.set('open', marker);
        marker.__popup.open(this.map, marker);
        return;
      }

      switch (this.model.get('popup')) {
        // Create the marker after making an AJAX request.
        case 'ajax':
          marker.__m.fetch(_.bind(function(fetch) {
            marker.__popup = new google.maps.InfoWindow({
              content: '<h1>' + fetch.get('title') + '</h1><p><em>ajaxed content</em></p>'
            });
            marker.__popup.open(this.map, marker);
            this.model.set('open', marker);
          }, this));
          break;

        // Create the marker without an additional request.
        case 'load':
          marker.__popup = new google.maps.InfoWindow({
            content: '<h1>' + marker.__m.get('title') + '</h1>' + marker.__m.get('description')
          });
          marker.__popup.open(this.map, marker);
          this.model.set('open', marker);
          break;

        case '':
          break;

        default:
          console.warn('Unknown popup type chosen');
          break;
      }

    },

    /**
     * Create a tooltip with the title of the marker.
     *
     * This will check the settings chosen by the user and will then create
     * an info window that will display the title as a tooltip.
     *
     * @param {object} marker
     *   Google maps marker object.
     */
    onHover: function(marker) {
      if (!this.model.get('label')) {
        return;
      }

      if (marker._tooltip) {
        marker._tooltip.open(this.map, marker);
        return;
      }

      marker._tooltip = new google.maps.InfoWindow({
        content: marker.__m.get('title')
      });

      marker._tooltip.open(this.map, marker);
    },

    /**
     * Close the open tooltip when mouseout of the marker.
     *
     * @param {object} marker
     *   Google maps marker object.
     */
    onHoverOut: function(marker) {
      if (!this.model.get('label') || !marker._tooltip) {
        return;
      }
      marker._tooltip.close();
    }

  });

})(Drupal, Backbone, _, window.google, window.MarkerClusterer);

