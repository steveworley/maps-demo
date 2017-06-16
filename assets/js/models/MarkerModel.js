/**
 * @file
 * A backbone model for store objects.
 */

(function (Drupal, Backbone, $, _) {

  'use strict';

  Drupal.maps.MarkerModel = Backbone.Model.extend(/** @lends Drupal.maps.StoreModel#*/{

    /**
     * @type {object}
     *
     * @prop {int} id
     * @prop {string} name
     * @prop {float} lat
     * @prop {float} lng
     * @prop {string} description
     * @prop {string} url
     */
    defaults: {

      /**
       * The NID of the object.
       *
       * @type {int}
       */
      id: 0,

      /**
       * The name of the store.
       *
       * @type {string}
       */
      name: '',

      /**
       * The latitude of the marker.
       *
       * @type {float}
       */
      lat: 0,

      /**
       * The longitude of the marker.
       *
       * @type {float}
       */
      lng: 0,

      /**
       * The description of the marker.
       *
       * @type {string}
       */
      description: '',

      /**
       * The url to fetch more information for the marker from.
       *
       * @type {string}
       */
      url: '/api/stores/{{ id }}'

    },

    /**
     * @inheritDoc
     *
     * @param options
     */
    constructor: function (attributes) {
      var store = {
        id: attributes.nid[0].value,
        title: attributes.title[0].value,
        lat: attributes.field_latitude[0].value,
        lng: attributes.field_longitude[0].value,
        description: attributes.body[0].value.replace(/(\r\n|\n\r|\r|\n)/g, '<br>$1').substr(0, 200)
      };

      Backbone.Model.prototype.constructor.call(this, store);
    },

    /**
     * Fetch additional data for this marker.
     */
    fetch: function (callback, marker) {
      _.templateSettings = {
        interpolate: /\{\{(.+?)\}\}/g
      };

      var url = _.template(this.get('url'))({id: this.get('id')});

      $.get(url, function (data) {
        data = new Drupal.maps.MarkerModel(data[0]);
        callback(data);
      });
    }
  });

})(Drupal, Backbone, jQuery, _);
