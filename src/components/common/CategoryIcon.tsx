import BoltOutlined from '@mui/icons-material/BoltOutlined';
import DirectionsCarOutlined from '@mui/icons-material/DirectionsCarOutlined';
import LocalMoviesOutlined from '@mui/icons-material/LocalMoviesOutlined';
import RestaurantOutlined from '@mui/icons-material/RestaurantOutlined';
import ShoppingBagOutlined from '@mui/icons-material/ShoppingBagOutlined';
import ShoppingCartOutlined from '@mui/icons-material/ShoppingCartOutlined';
import { Box, type SvgIconProps } from '@mui/material';
import type { ComponentType } from 'react';
import type { CategoryIcon as CategoryIconName } from '../../../shared/categories';
import { tokens } from '../../theme/theme';

const ICONS: Record<CategoryIconName, ComponentType<SvgIconProps>> = {
  'shopping-cart': ShoppingCartOutlined,
  film: LocalMoviesOutlined,
  car: DirectionsCarOutlined,
  utensils: RestaurantOutlined,
  'shopping-bag': ShoppingBagOutlined,
  zap: BoltOutlined,
};

/**
 * Monochrome category glyph on a neutral tile. Decorative: the category name is
 * always shown as text alongside, and colour is carried by a CategoryDot.
 */
export function CategoryIcon({ icon, size = 36 }: { icon: CategoryIconName; size?: number }) {
  const Icon = ICONS[icon];
  return (
    <Box
      component="span"
      aria-hidden
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: `${Math.round(size * 0.3)}px`,
        display: 'grid',
        placeItems: 'center',
        bgcolor: tokens.color.surfaceMuted,
        color: 'text.secondary',
      }}
    >
      <Icon sx={{ fontSize: size * 0.5 }} />
    </Box>
  );
}
