import { avatarStyles, cn } from '@/ui';
export function Avatar({ id, name, status }: { id: string; name: string; status?: string }) {
  return (
    <span className={cn(cn('avatar block shrink-[0]', avatarStyles))}>
      <img src={`https://i.pravatar.cc/80?img=${id}`} alt={name} />
      {status && <i className={cn(status)} />}
    </span>
  );
}
