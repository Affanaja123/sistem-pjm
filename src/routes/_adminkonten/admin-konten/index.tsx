import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_adminkonten/admin-konten/')({
  beforeLoad: () => {
    throw redirect({
      to: '/admin-konten/beranda',
    });
  },
});
