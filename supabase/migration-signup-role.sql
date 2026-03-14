-- Update profile creation trigger so signup metadata.role is persisted

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    case
      when new.raw_user_meta_data->>'role' in ('borrower', 'compliance')
        then new.raw_user_meta_data->>'role'
      else 'borrower'
    end
  );
  return new;
end;
$$ language plpgsql security definer;
