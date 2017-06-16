/**
 * @file
 * Initialise Google Maps in the #map-container.
 */

(function($, Drupal, google, MarkerClusterer) {

  var Lib = function() {
    this.data = {
      map: null,
      markers: []
    };

    this.options = {};

    this.destroy = function() {};

    this.init = function(options)  {
      this.options = $.extend(this.options, Drupal.mapLibDefaults, options);
      return this;
    };

    this.drawMap = function() {
      this.map = new google.maps.Map(document.getElementById(this.options.container), {
        zoom: Drupal.mapDefaults.zoom,
        center: {lat: Drupal.mapDefaults.center[0], lng: Drupal.mapDefaults.center[1]}
      });
    };

    this.markers = function(data) {
      var openMarker = false;

      for (var i = 0; i < data.length; i++) {
        var item = data[i];
        var position = new google.maps.LatLng(item.field_latitude[0].value, item.field_longitude[0].value);
        var marker = new google.maps.Marker({
          position: position,
          map: this.map,
          title: item.title[0].value
        });

        marker.opts = this.options;
        marker.storeId = item.nid[0].value;

        if (this.options.popup === 'load') {
          marker.iw = new google.maps.InfoWindow({
            content: this.options.infoTpl.strtr({
              '@title': item.title[0].value,
              '@body': item.body[0].value.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br>$2').substr(0, 200)
            })
          });
        }

        google.maps.event.addListener(marker, 'click', function() {
          if (this.tp) {
            this.tp.close();
          }

          if (openMarker) {
            openMarker.close();
          }

          if (this.iw) {
            openMarker = this.iw;
            this.iw.open(this.map, this);
            return;
          }

          if (this.opts.popup === 'ajax') {
            $.get('/api/stores/' + this.storeId, function(data) {
              if (typeof data[0] === 'undefined') {
                return;
              }

              var item = data[0];

              this.iw = new google.maps.InfoWindow({
                content: this.opts.infoTpl.strtr({
                  '@title': item.title[0].value,
                  '@body': item.body[0].value.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br>$2').substr(0, 200) + '<br><strong>-- ajax content --</strong>'
                })
              });
              openMarker = this.iw;
              this.iw.open(this.map, this);
            }.bind(this));
          }
        });

        if (this.options.withLabels) {
          marker.tp = new google.maps.InfoWindow({
            content: item.title[0].value
          });
          google.maps.event.addListener(marker, 'mouseover', function () {
            this.tp.open(this.map, this);
          });
          google.maps.event.addListener(marker, 'mouseout', function (marker) {
            this.tp.close();
          });
        }
        this.data.markers.push(marker);
      }

      if (this.options.cluster) {
        this.markerCluster = new MarkerClusterer(this.map, this.data.markers, {
          imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
        });
      }
    };

    return this;
  };

  Drupal.mapLibs.google = new Lib();

})(jQuery, Drupal, window.google, MarkerClusterer);
