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
  email: string;
  approved: boolean;
  pending_approval: boolean;
}

interface UserFormRow {
  id: number;
  email: string;
  roles: string[];
  action: 'approve' | 'delete' | '';
}

const AdminPage = () => {
  const { toast } = useToast();
  const [userRows, setUserRows] = useState<UserFormRow[]>([
    { id: 1, email: "", roles: [], action: '' },
    { id: 2, email: "", roles: [], action: '' }
  ]);
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

      setUserRoles(data || []);
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

  const updateUserRow = (rowId: number, field: keyof UserFormRow, value: any) => {
    setUserRows(prev => prev.map(row => 
      row.id === rowId ? { ...row, [field]: value } : row
    ));
  };

  const handleRoleChange = (rowId: number, role: string, checked: boolean) => {
    setUserRows(prev => prev.map(row => {
      if (row.id === rowId) {
        const newRoles = checked 
          ? [...row.roles, role]
          : row.roles.filter(r => r !== role);
        return { ...row, roles: newRoles };
      }
      return row;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validRows = userRows.filter(row => row.email && row.roles.length > 0);
    if (validRows.length === 0) {
      toast({
        title: "ข้อมูลไม่ครบ",
        description: "กรุณากรอกอีเมลและเลือกสิทธิ์อย่างน้อย 1 แถว",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      for (const row of validRows) {
        if (row.action === 'approve') {
          // Generate a mock user ID based on email
          const mockUserId = `user_${row.email.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
          
          // Insert new roles
          const roleInserts = row.roles.map(role => ({
            user_id: mockUserId,
            role: role as "teacher" | "student" | "guardian" | "admin",
            email: row.email,
            approved: true,
            pending_approval: false
          }));

          const { error: insertError } = await supabase
            .from('user_roles')
            .insert(roleInserts);

          if (insertError) throw insertError;
        }
      }

      toast({
        title: "บันทึกสำเร็จ",
        description: "กำหนดสิทธิ์ผู้ใช้สำเร็จแล้ว"
      });

      // Reset form
      setUserRows([
        { id: 1, email: "", roles: [], action: '' },
        { id: 2, email: "", roles: [], action: '' }
      ]);
      
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

  const handleApproveUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ 
          approved: true, 
          pending_approval: false 
        })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "อนุมัติสำเร็จ",
        description: "อนุมัติผู้ใช้เข้าสู่ระบบสำเร็จแล้ว"
      });

      fetchUserRoles();
    } catch (error) {
      console.error('Error approving user:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอนุมัติผู้ใช้ได้",
        variant: "destructive"
      });
    }
  };

  const groupedUserRoles = userRoles.reduce((acc, role) => {
    const existing = acc.find(item => item.user_id === role.user_id);
    if (existing) {
      existing.roles.push(role.role);
      existing.roleIds.push(role.id);
      if (!role.approved) existing.needsApproval = true;
    } else {
      acc.push({
        user_id: role.user_id,
        email: role.email || role.user_id, // Use email if available, fallback to user_id
        roles: [role.role],
        roleIds: [role.id],
        needsApproval: !role.approved
      });
    }
    return acc;
  }, [] as Array<{ user_id: string; email: string; roles: string[]; roleIds: string[]; needsApproval?: boolean }>);

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
          <div className="w-full max-w-2xl mx-auto lg:mx-0">
            {/* Pink Header */}
            <div className="bg-rose-300 rounded-t-lg px-6 py-4 text-center">
              <h2 className="text-lg font-semibold text-gray-800">กำหนดสิทธิ์ผู้ใช้ใหม่</h2>
            </div>
            
            {/* Form Body */}
            <div className="bg-gray-100 rounded-b-lg p-6 border border-gray-300">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Header Row */}
                <div className="flex items-center gap-6 text-sm font-medium text-gray-700 pb-2">
                  <div className="w-80">email ผู้ใช้งาน</div>
                  <div className="w-16 text-center">ครู</div>
                  <div className="w-20 text-center">นักเรียน</div>
                  <div className="w-24 text-center">ผู้ปกครอง</div>
                  <div className="w-16 text-center">อนุมัติ</div>
                  <div className="w-12 text-center">ลบ</div>
                </div>

                {/* User Rows */}
                {userRows.map((row, index) => (
                  <div key={row.id} className="flex items-center gap-6 py-3">
                    {/* Email Input */}
                    <Input
                      type="email"
                      placeholder=""
                      value={row.email}
                      onChange={(e) => updateUserRow(row.id, 'email', e.target.value)}
                      className="w-80 bg-white border border-gray-400 h-10"
                    />
                    
                    {/* Role Checkboxes */}
                    {availableRoles.map((role) => (
                      <div key={role.value} className="flex justify-center" style={{width: role.value === 'teacher' ? '64px' : role.value === 'student' ? '80px' : '96px'}}>
                        <Checkbox
                          checked={row.roles.includes(role.value)}
                          onCheckedChange={(checked) => 
                            handleRoleChange(row.id, role.value, checked === true)
                          }
                          className="border-gray-400 w-5 h-5"
                        />
                      </div>
                    ))}
                    
                    {/* Action Radio Buttons */}
                    <div className="flex justify-center w-16">
                      <input
                        type="radio"
                        name={`action-${row.id}`}
                        value="approve"
                        checked={row.action === 'approve'}
                        onChange={() => updateUserRow(row.id, 'action', 'approve')}
                        className="w-5 h-5"
                      />
                    </div>
                    <div className="flex justify-center w-12">
                      <input
                        type="radio"
                        name={`action-${row.id}`}
                        value="delete"
                        checked={row.action === 'delete'}
                        onChange={() => updateUserRow(row.id, 'action', 'delete')}
                        className="w-5 h-5"
                      />
                    </div>
                  </div>
                ))}

                <Button 
                  type="submit" 
                  className="w-full mt-6 bg-primary hover:bg-primary/90" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "กำลังบันทึก..." : "บันทึกสิทธิ์"}
                </Button>
              </form>
            </div>
          </div>

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
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>อีเมล</TableHead>
                        <TableHead>สิทธิ์</TableHead>
                        <TableHead>สถานะ</TableHead>
                        <TableHead className="text-center">การจัดการ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groupedUserRoles.map((user) => (
                        <TableRow key={user.user_id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{user.email}</p>
                              <p className="text-sm text-muted-foreground">
                                รหัส: {user.user_id.slice(0, 8)}...
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {user.roles.map((role, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {getRoleLabel(role)}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            {user.needsApproval ? (
                              <Badge variant="outline" className="text-orange-600 border-orange-600">
                                รอการอนุมัติ
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                อนุมัติแล้ว
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2 justify-center">
                              {user.needsApproval && (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleApproveUser(user.user_id)}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  อนุมัติ
                                </Button>
                              )}
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
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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