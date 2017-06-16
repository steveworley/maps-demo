/**
 * @file
 * A Backbone view that provides the visual context for the Leaflet map.
 */

(function (Drupal, Backbone, _, L) {

  'use strict';

  Drupal.maps.LeafletView = Backbone.View.extend(/** @lends Drupal.maps.LeafletView */{

    /**
     * The MapModel configuration object.
     *
     * @prop {Drupal.maps.MapModel}
     */
    model: Drupal.maps.MapModel,

    /**
     * A leaflet map object.
     *
     * @prop {object}
     */
    map: null,

    /**
     * A local array for marker objects.
     *
     * @prop {array}
     */
    markers: [],

    /**
     * Sets up the events and fetches the markers.
     *
     * @constructs
     *
     * @arguments Backbone.View
     */
    initialize: function () {
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

      // Leaflet can't be bound to the same element without removing the
      // previous instance of the map so we add this to the model and remove here.
      if (this.model.get('mo')) {
        var previousMap = this.model.get('mo');
        previousMap.remove();
      }

      this.map = L.map(this.$el.get(0), {
        worldCopyJump: this.model.get('worldCopyJump')
      }).setView(mapSettings.center, mapSettings.zoom);

      L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.map);

      this.model.set('mo', this.map);
    },

    /**
     * @inheritdoc
     *
     * @returns {Drupal.maps.LeafletView}
     */
    drawMarkers: function () {
      this.$el.parent().find('.loading-container').remove();
      this.markers = [];

      if (this.model.get('cluster')) {
        this.markers = L.markerClusterGroup({
          iconCreateFunction: function(cluster) {
            return L.divIcon({html: '<b>' + cluster.getChildCount() + '</b>', iconSize: L.point(20, 20)});
          }
        });
      }

      _.each(this.model.get('markers'), function (store) {
        var marker = L.marker([store.get('lat'), store.get('lng')]);

        if (this.model.get('cluster')) {
          // Add the marker to the cluster object.
          this.markers.addLayer(marker);
        } else {
          // Add the marker to the local markers array and then to the map.
          this.markers.push(marker);
          marker.addTo(this.map);
        }

        marker.__m = store;

        marker.on('mouseover', _.bind(this.onHover, this, marker));
        marker.on('mouseleave', _.bind(this.onHoverOut, this, marker));
        marker.on('click', _.bind(this.onClick, this, marker));

      }.bind(this));

      if (this.model.get('cluster')) {
        // Add the cluster to the map.
        this.map.addLayer(this.markers);
      }

      return this;
    },

    /**
     * Create a tooltip with the title of the marker.
     *
     * This will check settings for the model and then create the tooltip
     * if required.
     *
     * @param {object} marker
     *   Leaflet map marker object.
     */
    onHover: function (marker) {
      if (!this.model.get('label')) {
        return;
      }

      if (!marker._hasTooltip) {
        marker.bindTooltip(marker.__m.get('title'));
        marker._hasTooltip = true;
      }

      marker.openTooltip();
    },

    /**
     * Close the tooltip when mouse leaves.
     *
     * @param {object} marker
     *   Leaflet map marker object.
     */
    onHoverOut: function (marker) {
      marker.closeTooltip();
    },

    /**
     * Click handler for a map marker.
     *
     * JIT creation of the marker description popup. If the model is configured
     * to load the description via AJAX this will trigger a request to the marker
     * URL to fetch more data before showing the popup.
     *
     * @param {object} marker
     *   The Leaflet marker object.
     */
    onClick: function (marker) {
      if (marker._hasTooltip) {
        marker.closeTooltip();
      }

      if (this.model.has('open')) {
        this.model.get('open').closePopup();
      }

      if (marker.__popup) {
        this.model.set('open', marker);
        marker.__popup = true;
        marker.openPopup();
      }

      switch(this.model.get('popup')) {

        case 'ajax':
          marker.__m.fetch(_.bind(function (fetch) {
            marker.bindPopup('<h1>' + fetch.get('title') + '</h1><p><em>ajaxed content</em></p>');
            marker.openPopup();
            this.model.set('open', marker);
          }, this));
          break;

        case 'load':
          marker.bindPopup('<h1>' + marker.__m.get('title') + '</h1>' + marker.__m.get('description'));
          marker.openPopup();
          this.model.set('open', marker);
          break;

        case '':
          break;

        default:
          console.warn('Unknown popup type chosen');
          break;
      }

    }

  });

})(Drupal, Backbone, _, window.L);
