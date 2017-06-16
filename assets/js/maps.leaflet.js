/**
 * @file
 * Leaflet stuffs for the maps.
 */

(function($, Drupal, L) {

  var Lib = function() {
    this.data = {
      map: null,
      markers: []
    };

    this.options = {};

    this.destroy = function() {
      if (this.data.map) {
        this.data.map.remove();
      }
    };

    this.init = function(options) {
      this.options = $.extend(this.options, Drupal.mapLibDefaults, options);
      return this;
    };

    this.drawMap = function() {
      this.data.map = L.map(this.options.container, {
        worldCopyJump: this.options.worldCopyJump
      }).setView(Drupal.mapDefaults.center, Drupal.mapDefaults.zoom);
      L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.data.map);
    };

    this.markers = function(data) {
      var openMarker;

      if (this.options.cluster) {
        this.data.markers = L.markerClusterGroup({
          iconCreateFunction: function(cluster) {
            return L.divIcon({html: '<b>' + cluster.getChildCount() + '</b>', iconSize: L.point(20, 20)});
          }
        });
      }

      for (var i = 0; i < data.length; i++) {
        var item = data[i];
        var marker = L.marker([item.field_latitude[0].value, item.field_longitude[0].value]);

        if (this.options.cluster) {
          this.data.markers.addLayer(marker);
        }

        marker.opts = this.options;
        marker.storeId = item.nid[0].value;

        if (!this.options.cluster) {
          marker.addTo(this.data.map);
        }

        if (this.options.withLabels) {
          marker.bindTooltip(item.title[0].value);
          marker.on('mouseenter', function () {
            marker.openTooltip();
          });
          marker.on('mouseleave', function () {
            marker.closeTooltip();
          });
        }

        if (this.options.popup === 'load') {
          marker.bindPopup(this.options.infoTpl.strtr({
            '@title': item.title[0].value,
            '@body': item.body[0].value.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br>$2').substr(0, 200)
          }));
        }

        if (this.options.popup === 'load' || this.options.popup === 'ajax') {
          marker.on('click', function (marker) {
            if (openMarker) {
              openMarker.closePopup();
            }

            if (this.opts.popup === 'load') {
              openMarker = marker;
              marker.openPopup();
            }

            if (this.opts.popup === 'ajax') {
              $.get('/api/stores/' + this.storeId, function (data) {
                if (typeof data[0] === 'undefined') {
                  return;
                }

                var item = data[0];

                this.bindPopup(this.opts.infoTpl.strtr({
                  '@title': item.title[0].value,
                  '@body': item.body[0].value.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br>$2').substr(0, 200) + '<br><strong>-- ajax content --</strong>'
                }));
                openMarker = this;
                this.openPopup();
              }.bind(this));
            }
          });
        }
      } // endfor.

      if (this.options.cluster) {
        this.data.map.addLayer(this.data.markers);
      }

    };

    return this;
  };

  Drupal.mapLibs.leaflet = new Lib();
})(jQuery, Drupal, window.L);
