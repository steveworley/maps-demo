/**
 * @file
 * Button binds and event triggers for map executions.
 */

(function($, Drupal, window) {

  Drupal.maps = {};

  Drupal.behaviors.mapsEvents = {

    showSnippet: function() {
      var $el = $(this);
      var $snippets = $('[data-snippetfor="' + $el.attr('name') + '"]');
      if ($('[name="showSnippets"]:checked').length === 0) {
        $snippets.addClass('hide');
        return;
      }
      $snippets.toggleClass('hide');
    },

    attach: function(context, settings) {

      $('[data-snippet]', context).on('click', function() {
        $.proxy(Drupal.behaviors.mapsEvents.showSnippet, this).call();
      });

      $('[name="showSnippets"]', context).on('click', function() {
        $('[data-snippet]:checked').each(function() {
          $.proxy(Drupal.behaviors.mapsEvents.showSnippet, this).call();
        });
      });

      var MapSettings = new Drupal.maps.MapModel();

      $('.map-controls .js-control', context).on('click', function() {
        MapSettings.set('title', $(this).data('lib'));
        MapSettings.set('label', $(':input[name="withLabels"]').is(':checked'));
        MapSettings.set('popup', $(':input[name="popup"]:checked').val());
        MapSettings.set('cluster', $(':input[name="cluster"]').is(':checked'));
        MapSettings.set('itemsPerPage', $(':input[name="totalMarkers"]').val());
        MapSettings.set('worldCopyJump', $(':input[name="worldCopyJump"]').is(':checked'));

        window.x = MapSettings;

        new Drupal.maps[$(this).data('view')]({
          el: '#map-container',
          model: MapSettings
        });

        return false;
      });
    }
  }

})(jQuery, Drupal, this);
