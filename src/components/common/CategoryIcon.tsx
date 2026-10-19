import BoltOutlined from '@mui/icons-material/BoltOutlined';
import DirectionsCarOutlined from '@mui/icons-material/DirectionsCarOutlined';
import LocalMoviesOutlined from '@mui/icons-material/LocalMoviesOutlined';
import RestaurantOutlined from '@mui/icons-material/RestaurantOutlined';
import ShoppingBagOutlined from '@mui/icons-material/ShoppingBagOutlined';
import ShoppingCartOutlined from '@mui/icons-material/ShoppingCartOutlined';
import { Box, type SvgIconProps } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { ComponentType } from 'react';
import type { CategoryIcon as CategoryIconName } from '../../../shared/categories';

const ICONS: Record<CategoryIconName, ComponentType<SvgIconProps>> = {
  'shopping-cart': ShoppingCartOutlined,
  film: LocalMoviesOutlined,
  car: DirectionsCarOutlined,
  utensils: RestaurantOutlined,
  'shopping-bag': ShoppingBagOutlined,
  zap: BoltOutlined,
};

interface CategoryIconProps {
  icon: CategoryIconName;
  color: string;
  size?: number;
}

/**
 * Category badge. The category colour is only a tinted background; the icon is
 * drawn in dark text colour so it keeps sufficient contrast for light hues.
 * Decorative: the category name is always shown as text next to it.
 */
export function CategoryIcon({ icon, color, size = 36 }: CategoryIconProps) {
  const Icon = ICONS[icon];
  return (
    <Box
      component="span"
      aria-hidden
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        bgcolor: alpha(color, 0.22),
        color: 'text.primary',
        boxShadow: `inset 0 0 0 1.5px ${color}`,
      }}
    >
      <Icon sx={{ fontSize: size * 0.55 }} />
    </Box>
  );
}
