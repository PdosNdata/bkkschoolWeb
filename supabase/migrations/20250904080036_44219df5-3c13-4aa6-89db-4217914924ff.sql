-- Add admin role to user chaiyapat@udonthani3.go.th
INSERT INTO public.user_roles (user_id, role)
VALUES ('3f7789e4-e152-4041-8b47-f1e954842a6c', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;