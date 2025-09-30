import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Users, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";

interface User {
  id: string;
  email: string;
  display_name?: string;
}

interface Permission {
  name: string;
  label: string;
}

const MenuPermissionsPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [userPermissions, setUserPermissions] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const permissions: Permission[] = [
    { name: "view_news", label: "ดูข่าวสาร" },
    { name: "create_news", label: "สร้างข่าวสาร" },
    { name: "edit_news", label: "แก้ไขข่าวสาร" },
    { name: "delete_news", label: "ลบข่าวสาร" },
    { name: "create_activity", label: "สร้างกิจกรรม" },
    { name: "edit_activity", label: "แก้ไขกิจกรรม" },
    { name: "delete_activity", label: "ลบกิจกรรม" }
  ];

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/');
          return;
        }

        const { data: roles, error: rolesError } = await supabase
          .from('user_roles')
          .select('role, approved')
          .eq('user_id', user.id);

        if (rolesError) {
          console.error('Error fetching user roles:', rolesError);
          return;
        }

        const isAdmin = roles?.some(r => r.role === 'admin' && r.approved);
        if (!isAdmin) {
          toast({
            title: "ไม่ได้รับอนุญาต",
            description: "คุณไม่มีสิทธิ์เข้าถึงหน้านี้",
            variant: "destructive"
          });
          navigate('/');
          return;
        }

        await fetchUsers();
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking auth:', error);
        navigate('/');
      }
    };

    checkAuthAndFetch();
  }, [navigate, toast]);

  const fetchUsers = async () => {
    try {
      const { data: userRoles, error } = await supabase
        .from('user_roles')
        .select('user_id, email')
        .eq('approved', true);

      if (error) throw error;

      const uniqueUsers = userRoles.reduce((acc: User[], role) => {
        if (!acc.find(u => u.id === role.user_id)) {
          acc.push({
            id: role.user_id,
            email: role.email || 'ไม่ระบุอีเมล'
          });
        }
        return acc;
      }, []);

      setUsers(uniqueUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลผู้ใช้ได้",
        variant: "destructive"
      });
    }
  };

  const fetchUserPermissions = async (userId: string) => {
    try {
      const { data: permissions, error } = await supabase
        .from('user_permissions')
        .select('permission_name, granted')
        .eq('user_id', userId);

      if (error) throw error;

      const permissionsMap: Record<string, boolean> = {};
      permissions.forEach(p => {
        permissionsMap[p.permission_name] = p.granted;
      });

      setUserPermissions(permissionsMap);
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดสิทธิ์ผู้ใช้ได้",
        variant: "destructive"
      });
    }
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUser(userId);
    if (userId) {
      fetchUserPermissions(userId);
    } else {
      setUserPermissions({});
    }
  };

  const handlePermissionChange = (permission: string, granted: boolean) => {
    setUserPermissions(prev => ({
      ...prev,
      [permission]: granted
    }));
  };

  const handleSavePermissions = async () => {
    if (!selectedUser) {
      toast({
        title: "กรุณาเลือกผู้ใช้",
        description: "โปรดเลือกผู้ใช้ที่ต้องการจัดการสิทธิ์",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Delete existing permissions for this user
      await supabase
        .from('user_permissions')
        .delete()
        .eq('user_id', selectedUser);

      // Insert new permissions
      const permissionsToInsert = Object.entries(userPermissions).map(([permission, granted]) => ({
        user_id: selectedUser,
        permission_name: permission,
        granted
      }));

      const { error } = await supabase
        .from('user_permissions')
        .insert(permissionsToInsert);

      if (error) throw error;

      toast({
        title: "บันทึกสำเร็จ",
        description: "สิทธิ์ผู้ใช้ได้รับการอัปเดตแล้ว",
      });
    } catch (error) {
      console.error('Error saving permissions:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกสิทธิ์ได้",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-primary">จัดการสิทธิ์เมนู</h1>
          </div>
          <p className="text-lg text-muted-foreground">กำหนดสิทธิ์การเข้าใช้เมนูต่าง ๆ สำหรับผู้ใช้</p>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              เลือกผู้ใช้และกำหนดสิทธิ์
            </CardTitle>
            <CardDescription>
              เลือกผู้ใช้จากรายการด้านล่าง และกำหนดสิทธิ์ในการเข้าใช้เมนูต่าง ๆ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* User Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">ผู้ใช้</label>
              <Select value={selectedUser} onValueChange={handleUserSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกผู้ใช้" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Permissions Grid */}
            {selectedUser && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">สิทธิ์การใช้งาน</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {permissions.map((permission) => (
                    <div key={permission.name} className="flex items-center space-x-2 p-3 border rounded-lg">
                      <Checkbox
                        id={permission.name}
                        checked={userPermissions[permission.name] || false}
                        onCheckedChange={(checked) => 
                          handlePermissionChange(permission.name, checked as boolean)
                        }
                      />
                      <label
                        htmlFor={permission.name}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {permission.label}
                      </label>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleSavePermissions}
                    disabled={isSubmitting}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isSubmitting ? "กำลังบันทึก..." : "บันทึกสิทธิ์"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default MenuPermissionsPage;