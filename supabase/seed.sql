insert into public.profiles (id, full_name, role, qr_value)
values
  ('11111111-1111-1111-1111-111111111111', 'Jordan Cole', 'Supervisor', 'logz:person:11111111-1111-1111-1111-111111111111'),
  ('22222222-2222-2222-2222-222222222222', 'Riley Mason', 'Storeperson', 'logz:person:22222222-2222-2222-2222-222222222222')
on conflict (id) do nothing;

insert into public.store_locations (id, location_code, name, description)
values
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'LOC-001', 'Tool Trailer', 'Primary mobile tooling trailer for field issue and return.'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', 'LOC-002', 'Tool Container 1', 'Main storage container for shutdown work packs and shared tooling.'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3', 'LOC-003', 'Tool Container 2', 'Overflow tooling container for additional kits and backup stock.'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4', 'LOC-004', 'Gangbox 1', 'Gangbox allocation point for daily issue tooling and hand tools.')
on conflict (id) do nothing;

insert into public.assets (
  id,
  asset_code,
  name,
  category,
  description,
  purchase_date,
  cost,
  current_status,
  current_holder,
  current_location,
  location_id,
  qr_value
)
values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    'LOG-0001',
    'Milwaukee Impact Driver',
    'Tool',
    '18V impact driver issued for shutdown mechanical team.',
    '2024-07-18',
    499.00,
    'OUT',
    'Jordan Cole',
    'Tool Trailer',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
    'logz:sample-impact-driver'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
    'LOG-0002',
    'Cat Service Ute',
    'Vehicle',
    'Site utility vehicle used for maintenance response.',
    '2023-11-02',
    38450.00,
    'IN',
    null,
    'Tool Container 2',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3',
    'logz:sample-service-ute'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3',
    'LOG-0003',
    'Flange Alignment Kit',
    'Equipment',
    'Portable alignment kit for pump and drive coupling work.',
    '2025-01-10',
    1260.00,
    'IN',
    null,
    'Gangbox 1',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4',
    'logz:sample-alignment-kit'
  )
on conflict (id) do nothing;

insert into public.asset_logs (
  id,
  asset_id,
  action,
  scanned_by,
  scanned_by_name,
  note,
  location,
  created_at
)
values
  (
    gen_random_uuid(),
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    'OUT',
    '11111111-1111-1111-1111-111111111111',
    'Jordan Cole',
    'Issued to shutdown crew for night shift.',
    'Tool Trailer',
    timezone('utc', now()) - interval '4 hours'
  ),
  (
    gen_random_uuid(),
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
    'IN',
    '22222222-2222-2222-2222-222222222222',
    'Riley Mason',
    'Returned after inspection run.',
    'Tool Container 2',
    timezone('utc', now()) - interval '18 hours'
  ),
  (
    gen_random_uuid(),
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3',
    'IN',
    '22222222-2222-2222-2222-222222222222',
    'Riley Mason',
    'Checked back into gangbox stock.',
    'Gangbox 1',
    timezone('utc', now()) - interval '2 days'
  );