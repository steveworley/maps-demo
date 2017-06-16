/**
 * @file
 * A Backbone Model for the map objects.
 */

(function (Drupal, Backbone, $, _) {

  'use strict';

  Drupal.maps.MapModel = Backbone.Model.extend(/** @lends Drupal.maps.MapModel */{

    /**
     * @type {object}
     *
     * @prop {string} title
     * @prop {string} url
     * @prop {int} itemsPerPage
     * @prop {boolean} cluster
     * @prop {boolean} label
     * @prop {string} popup
     * @prop {object} map
     * @prop {array} markers
     * @prop {object} mo
     */
    defaults: /** @lends Drupal.maps.MapModel# */{

      /**
       * The title of the map library.
       *
       * @type {string}
       */
      title: '',

      /**
       * The URL from which to fetch the markers.
       *
       * @type {string}
       */
      url: '/api/stores?items_per_page={{ items }}',

      /**
       * The number of stores to return.
       *
       * @type {int|boolean}
       */
      itemsPerPage: false,

      /**
       * Represents if the map should cluster the markers.
       *
       * @type {boolean}
       */
      cluster: false,

      /**
       * Represents if the map should show labels.
       *
       * @type {boolean}
       */
      label: false,

      /**
       * Represents if the map should show popups and which type of popup
       * should be shown.
       *
       * @type {string}
       */
      popup: '',

      /**
       * Map default settings object
       *
       * @type {object}
       */
      map: {
        center: [51.505, -0.09],
        zoom: 2
      },

      /**
       * Markers.
       *
       * @type {Array}
       */
      markers: [],

      /**
       * An instance of the map object.
       *
       * @type {object}
       */
      mo: false
    },

    /**
     * Fetches markers for the map.
     */
    getMarkers: function() {
      _.templateSettings = {
        interpolate: /\{\{(.+?)\}\}/g
      };

      var url = _.template(this.get('url'));

      this.trigger('markers:before');

      $.get(url({items: this.get('itemsPerPage')}), function(data) {
        var markers = [];
        _.each(data, function(item) {
          markers.push(new Drupal.maps.MarkerModel(item));
        });
        this.set('markers', markers);
      }.bind(this));
      return this;
    }

  });

})(Drupal, Backbone, jQuery, _);
