import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Trash2, Plus, Search, Upload, CheckCircle } from "lucide-react";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userRows, setUserRows] = useState<UserFormRow[]>([
    { id: 1, email: "", roles: [], action: '' },
    { id: 2, email: "", roles: [], action: '' }
  ]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isImporting, setIsImporting] = useState(false);

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

      // Get unique user IDs to fetch emails
      const userIds = [...new Set(data?.map(role => role.user_id) || [])];
      
      if (userIds.length > 0) {
        // Call edge function to get real email addresses
        const { data: emailData, error: emailError } = await supabase.functions.invoke('get-user-emails', {
          body: { userIds }
        });

        if (emailError) {
          console.error('Error fetching emails:', emailError);
        }

        const userEmailMap = emailData?.userEmailMap || {};

        // Update user roles with real email addresses
        const updatedUserRoles = data?.map(role => ({
          ...role,
          email: userEmailMap[role.user_id] || role.email || 'ไม่ระบุอีเมล'
        })) || [];

        setUserRoles(updatedUserRoles);
      } else {
        setUserRoles(data || []);
      }
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

  const handleBulkApproval = async () => {
    const pendingUsers = filteredUsers.filter(user => user.needsApproval);
    
    if (pendingUsers.length === 0) {
      toast({
        title: "ไม่มีผู้ใช้ที่ต้องอนุมัติ",
        description: "ไม่มีผู้ใช้ที่รอการอนุมัติ",
        variant: "destructive"
      });
      return;
    }

    try {
      for (const user of pendingUsers) {
        await handleApproveUser(user.user_id);
      }

      toast({
        title: "อนุมัติทั้งหมดสำเร็จ",
        description: `อนุมัติผู้ใช้ ${pendingUsers.length} คนสำเร็จแล้ว`
      });
    } catch (error) {
      console.error('Error bulk approving users:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอนุมัติผู้ใช้ทั้งหมดได้",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv') {
      toast({
        title: "ไฟล์ไม่ถูกต้อง",
        description: "กรุณาเลือกไฟล์ CSV เท่านั้น",
        variant: "destructive"
      });
      return;
    }

    setIsImporting(true);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      // Expected headers: ชื่อ, อีเมล, รหัสผ่าน, สถานะ
      const expectedHeaders = ['ชื่อ', 'อีเมล', 'รหัสผ่าน', 'สถานะ'];
      
      const headerCheck = expectedHeaders.every(header => 
        headers.some(h => h.includes(header))
      );

      if (!headerCheck) {
        toast({
          title: "รูปแบบไฟล์ไม่ถูกต้อง",
          description: "ไฟล์ CSV ต้องมีคอลัมน์: ชื่อ, อีเมล, รหัสผ่าน, สถานะ",
          variant: "destructive"
        });
        return;
      }

      const roleMapping: { [key: string]: string } = {
        'ครู': 'teacher',
        'นักเรียน': 'student',
        'ผู้ปกครอง': 'guardian'
      };

      let successCount = 0;
      const errors: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length < 4) continue;

        const [name, email, password, status] = values;
        const roleKey = roleMapping[status];

        if (!roleKey) {
          errors.push(`แถวที่ ${i + 1}: สถานะ "${status}" ไม่ถูกต้อง`);
          continue;
        }

        try {
          const mockUserId = `user_${email.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}_${i}`;
          
          const { error } = await supabase
            .from('user_roles')
            .insert({
              user_id: mockUserId,
              role: roleKey as "teacher" | "student" | "guardian",
              email: email,
              approved: false,
              pending_approval: true
            });

          if (error) {
            errors.push(`แถวที่ ${i + 1}: ${error.message}`);
          } else {
            successCount++;
          }
        } catch (error) {
          errors.push(`แถวที่ ${i + 1}: เกิดข้อผิดพลาดในการบันทึก`);
        }
      }

      if (successCount > 0) {
        // Refresh the user roles list to show imported data
        await fetchUserRoles();
        
        toast({
          title: "นำเข้าข้อมูลสำเร็จ",
          description: `นำเข้าข้อมูลผู้ใช้ ${successCount} คนสำเร็จ และแสดงรายการล่าสุดแล้ว`
        });
      }

      if (errors.length > 0) {
        toast({
          title: "มีข้อผิดพลาดบางส่วน",
          description: `นำเข้าสำเร็จ ${successCount} คน, พบข้อผิดพลาด ${errors.length} รายการ`,
          variant: errors.length > successCount ? "destructive" : "default"
        });
      }

    } catch (error) {
      console.error('Error importing CSV:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถนำเข้าไฟล์ CSV ได้",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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

  // Filter and search logic
  const filteredUsers = groupedUserRoles.filter(user => {
    // Search filter
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.user_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Role filter
    const matchesRole = roleFilter === "all" || user.roles.includes(roleFilter);
    
    // Status filter
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "approved" && !user.needsApproval) ||
                         (statusFilter === "pending" && user.needsApproval);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

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

        <div className="w-full max-w-6xl mx-auto">

          {/* Users List Section */}
          <Card>
            <CardHeader>
              <CardTitle>รายชื่อผู้ใช้และสิทธิ์</CardTitle>
              <CardDescription>
                รายการผู้ใช้ทั้งหมดและสิทธิ์ที่ได้รับ
              </CardDescription>
              
              {/* CSV Import Section */}
              <div className="mb-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isImporting}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isImporting ? "กำลังนำเข้า..." : "นำเข้าไฟล์ CSV"}
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  รูปแบบไฟล์: ชื่อ, อีเมล, รหัสผ่าน, สถานะ (ครู/นักเรียน/ผู้ปกครอง)
                </p>
              </div>

              {/* Search and Filter Section */}
              <div className="space-y-4 pt-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="ค้นหาด้วยอีเมลหรือรหัสผู้ใช้..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="กรองตามสิทธิ์" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ทุกสิทธิ์</SelectItem>
                      <SelectItem value="teacher">ครู</SelectItem>
                      <SelectItem value="student">นักเรียน</SelectItem>
                      <SelectItem value="guardian">ผู้ปกครอง</SelectItem>
                      <SelectItem value="admin">ผู้ดูแลระบบ</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="กรองตามสถานะ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ทุกสถานะ</SelectItem>
                      <SelectItem value="approved">อนุมัติแล้ว</SelectItem>
                      <SelectItem value="pending">รอการอนุมัติ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Bulk Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={handleBulkApproval}
                    variant="default"
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    disabled={!filteredUsers.some(user => user.needsApproval)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    อนุมัติทั้งหมด
                  </Button>
                </div>
                
                {/* Results Count */}
                <div className="text-sm text-muted-foreground">
                  แสดง {filteredUsers.length} จาก {groupedUserRoles.length} ผู้ใช้
                  {filteredUsers.filter(user => user.needsApproval).length > 0 && (
                    <span className="text-orange-600 ml-2">
                      (รอการอนุมัติ {filteredUsers.filter(user => user.needsApproval).length} คน)
                    </span>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredUsers.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  {groupedUserRoles.length === 0 ? "ยังไม่มีผู้ใช้ในระบบ" : "ไม่พบผู้ใช้ที่ค้นหา"}
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
                      {filteredUsers.map((user) => (
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