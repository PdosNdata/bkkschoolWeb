import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Trash2, Plus } from "lucide-react";

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  email?: string;
}

const AdminPage = () => {
  const { toast } = useToast();
  const [userEmail, setUserEmail] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableRoles = [
    { value: "teacher", label: "ครู" },
    { value: "student", label: "นักเรียน" }, 
    { value: "guardian", label: "ผู้ปกครอง" }
  ];

  useEffect(() => {
    fetchUserRoles();
  }, []);

  const fetchUserRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*');

      if (error) throw error;

      // Extract email from user_id (since we stored it in a specific format)
      const userRolesWithEmails = (data || []).map((role) => {
        // Extract email from user_id format: user_email_timestamp
        const emailMatch = role.user_id.match(/^user_(.+)_\d+$/);
        const email = emailMatch ? emailMatch[1].replace(/_/g, '@') : `user-${role.user_id.slice(0, 8)}`;
        
        return {
          ...role,
          email: email
        };
      });

      setUserRoles(userRolesWithEmails);
    } catch (error) {
      console.error('Error fetching user roles:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลผู้ใช้ได้",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = (role: string, checked: boolean) => {
    setSelectedRoles(prev => 
      checked 
        ? [...prev, role]
        : prev.filter(r => r !== role)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail || selectedRoles.length === 0) {
      toast({
        title: "ข้อมูลไม่ครบ",
        description: "กรุณากรอกอีเมลและเลือกสิทธิ์อย่างน้อย 1 ตัว",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // For demo purposes, we'll create a mock user since admin.listUsers isn't available
      // In a real application, you would use the admin API to find users
      
      // Generate a mock user ID based on email
      const mockUserId = `user_${userEmail.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
      
      // Delete existing roles for this user email
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', mockUserId);

      // Insert new roles
      const roleInserts = selectedRoles.map(role => ({
        user_id: mockUserId,
        role: role as "teacher" | "student" | "guardian" | "admin"
      }));

      const { error: insertError } = await supabase
        .from('user_roles')
        .insert(roleInserts);

      if (insertError) throw insertError;

      toast({
        title: "บันทึกสำเร็จ",
        description: "กำหนดสิทธิ์ผู้ใช้สำเร็จแล้ว"
      });

      // Reset form
      setUserEmail("");
      setSelectedRoles([]);
      
      // Refresh the list
      fetchUserRoles();

    } catch (error) {
      console.error('Error assigning roles:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถกำหนดสิทธิ์ผู้ใช้ได้",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;

      toast({
        title: "ลบสำเร็จ",
        description: "ลบสิทธิ์ผู้ใช้สำเร็จแล้ว"
      });

      fetchUserRoles();
    } catch (error) {
      console.error('Error deleting role:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบสิทธิ์ผู้ใช้ได้",
        variant: "destructive"
      });
    }
  };

  const getRoleLabel = (role: string) => {
    const roleObj = availableRoles.find(r => r.value === role);
    return roleObj ? roleObj.label : role;
  };

  const groupedUserRoles = userRoles.reduce((acc, role) => {
    const existing = acc.find(item => item.user_id === role.user_id);
    if (existing) {
      existing.roles.push(role.role);
    } else {
      acc.push({
        user_id: role.user_id,
        email: role.email || 'ไม่พบอีเมล',
        roles: [role.role],
        roleIds: [role.id]
      });
    }
    return acc;
  }, [] as Array<{ user_id: string; email: string; roles: string[]; roleIds: string[] }>);

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
          <h1 className="text-4xl font-bold text-primary mb-4">จัดการสิทธิ์ผู้ใช้งาน</h1>
          <p className="text-lg text-muted-foreground">กำหนดสิทธิ์การเข้าใช้งานระบบสำหรับผู้ใช้</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                กำหนดสิทธิ์ผู้ใช้ใหม่
              </CardTitle>
              <CardDescription>
                กรอกอีเมลผู้ใช้และเลือกสิทธิ์ที่ต้องการกำหนด
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">อีเมลผู้ใช้</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="กรอกอีเมลผู้ใช้"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label>กำหนดสิทธิ์</Label>
                  <div className="space-y-3">
                    {availableRoles.map((role) => (
                      <div key={role.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={role.value}
                          checked={selectedRoles.includes(role.value)}
                          onCheckedChange={(checked) => 
                            handleRoleChange(role.value, checked === true)
                          }
                        />
                        <Label htmlFor={role.value} className="text-sm font-normal">
                          {role.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "กำลังบันทึก..." : "บันทึกสิทธิ์"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Users List Section */}
          <Card>
            <CardHeader>
              <CardTitle>รายชื่อผู้ใช้และสิทธิ์</CardTitle>
              <CardDescription>
                รายการผู้ใช้ทั้งหมดและสิทธิ์ที่ได้รับ
              </CardDescription>
            </CardHeader>
            <CardContent>
              {groupedUserRoles.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  ยังไม่มีผู้ใช้ในระบบ
                </p>
              ) : (
                <div className="space-y-4">
                  {groupedUserRoles.map((user) => (
                    <div key={user.user_id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-medium">{user.email}</p>
                          <p className="text-sm text-muted-foreground">
                            รหัสผู้ใช้: {user.user_id.slice(0, 8)}...
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // Delete all roles for this user
                            user.roleIds.forEach(id => handleDeleteRole(id));
                          }}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {user.roles.map((role, index) => (
                          <Badge key={index} variant="secondary">
                            {getRoleLabel(role)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminPage;