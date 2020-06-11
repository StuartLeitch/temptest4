import { Avatar } from './Avatar';
import { AvatarFont } from './AvatarFont';
import { AvatarImage } from './AvatarImage';

import { AvatarAddonBadge } from './AvatarAddonBadge';
import { AvatarAddonIcon } from './AvatarAddonIcon';

(Avatar as any).Font = AvatarFont;
(Avatar as any).Image = AvatarImage;

const AvatarAddOn = {
  Icon: AvatarAddonIcon,
  Badge: AvatarAddonBadge
};

export default Avatar;
export { AvatarAddOn };
