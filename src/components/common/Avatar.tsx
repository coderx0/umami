import { lorelei } from '@dicebear/collection';
import { createAvatar } from '@dicebear/core';
import { useMemo } from 'react';
import { getColor, getPastel } from '@/lib/colors';

const lib = lorelei;

export function Avatar({ seed, size = 128, ...props }: { seed: string; size?: number }) {
  const backgroundColor = getPastel(getColor(seed), 4);

  const avatar = useMemo(() => {
    return createAvatar(lib, {
      ...props,
      seed,
      size,
      backgroundColor: [backgroundColor],
    }).toDataUri();
  }, []);

  // generated from the session id: decorative (guidelines 1.6); the link around it is named
  return <img src={avatar} alt="" style={{ borderRadius: '100%', width: size }} />;
}
