<?php

namespace Drupal\maps\Plugin\Block;

use Drupal\Core\Block\BlockBase;

/**
 * Provides a 'Map' block.
 *
 * @Block(
 *    id = "map_block",
 *    admin_label = @Translation("Map Block")
 * )
 */
class MapBlock extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function build() {
    return [
      '#theme' => 'map_container',
      '#libs' => ['leaflet', 'google'],
      '#source' => '/api/stores',
    ];
  }

}
