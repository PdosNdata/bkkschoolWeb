import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, UserCheck, Mail, Phone, Building, FileText, Edit, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Personnel {
  id: string;
  full_name: string;
  position: string;
  department: string;
  subject_group: string;
  email: string;
  phone: string;
  photo_url: string;
  additional_details: string;
  created_at: string;
}

const PersonnelPage = () => {
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPersonnel();
  }, []);

  const fetchPersonnel = async () => {
    try {
      const { data, error } = await supabase
        .from('personnel')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPersonnel(data || []);
    } catch (error) {
      console.error('Error fetching personnel:', error);
      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลบุคลากรได้",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePersonnel = async (id: string, name: string) => {
    try {
      const { error } = await supabase
        .from('personnel')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "ลบบุคลากรสำเร็จ",
        description: `ลบข้อมูลของ ${name} แล้ว`,
      });

      // Refresh data
      fetchPersonnel();
    } catch (error) {
      console.error('Error deleting personnel:', error);
      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบข้อมูลบุคลากรได้",
      });
    }
  };

  const filteredPersonnel = personnel.filter(person =>
    person.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.subject_group?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 to-blue-50">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">ระบบจัดการข้อมูลบุคลากร</h1>
              <p className="text-gray-600">เพิ่ม แก้ไข และจัดการข้อมูลบุคลากรในสถานศึกษา</p>
            </div>
            <div className="flex gap-3">
              <Link to="/personnel-report">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  <FileText className="w-4 h-4 mr-2" />
                  รายงานบุคลากร
                </Button>
              </Link>
              <Link to="/personnel-form">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  เพิ่มบุคลากรใหม่
                </Button>
              </Link>
            </div>
          </div>

          {/* Search Section */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="ค้นหาบุคลากร (ชื่อ, ตำแหน่ง, แผนก, กลุ่มสาระฯ)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Personnel List */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="mb-6">
                <Card className="bg-white border-purple-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <UserCheck className="w-5 h-5 text-purple-600" />
                        <span className="text-sm text-gray-600">
                          รายการบุคลากร ({filteredPersonnel.length} คน)
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Personnel Grid */}
              {filteredPersonnel.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {searchTerm ? 'ไม่พบข้อมูลบุคลากร' : 'ยังไม่มีข้อมูลบุคลากร'}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm 
                        ? 'ลองค้นหาด้วยคำอื่น หรือเพิ่มบุคลากรใหม่' 
                        : 'เริ่มต้นเพิ่มข้อมูลบุคลากรใหม่เพื่อจัดการระบบ'
                      }
                    </p>
                    <Link to="/personnel-form">
                      <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        เพิ่มบุคลากรใหม่
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredPersonnel.map((person) => (
                    <Card key={person.id} className="hover:shadow-lg transition-shadow relative">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-6">
                          {person.photo_url ? (
                            <img
                              src={person.photo_url}
                              alt={person.full_name}
                              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                              <UserCheck className="w-8 h-8 text-purple-600" />
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                                  {person.full_name}
                                </h3>
                                {person.position && (
                                  <p className="text-lg text-purple-600 font-medium mb-3">
                                    {person.position}
                                  </p>
                                )}
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                                  {person.department && (
                                    <div className="flex items-center">
                                      <Building className="w-4 h-4 mr-2 flex-shrink-0" />
                                      <span>{person.department}</span>
                                    </div>
                                  )}
                                  {person.subject_group && (
                                    <div className="flex items-center">
                                      <UserCheck className="w-4 h-4 mr-2 flex-shrink-0" />
                                      <span>{person.subject_group}</span>
                                    </div>
                                  )}
                                  {person.email && (
                                    <div className="flex items-center">
                                      <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                                      <span>{person.email}</span>
                                    </div>
                                  )}
                                  {person.phone && (
                                    <div className="flex items-center">
                                      <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                                      <span>{person.phone}</span>
                                    </div>
                                  )}
                                </div>
                                
                                {person.additional_details && (
                                  <div className="mt-3 pt-3 border-t border-gray-100">
                                    <p className="text-sm text-gray-600">
                                      {person.additional_details}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Action Buttons - Bottom Right */}
                          <div className="absolute bottom-4 right-4 flex space-x-2">
                            <Link to={`/personnel-form?id=${person.id}`}>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 border-purple-200 hover:bg-purple-50 hover:border-purple-300"
                              >
                                <Edit className="w-4 h-4 text-purple-600" />
                              </Button>
                            </Link>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 w-8 p-0 border-red-200 hover:bg-red-50 hover:border-red-300"
                                >
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>ยืนยันการลบบุคลากร</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    คุณต้องการลบข้อมูลของ "{person.full_name}" หรือไม่? การกระทำนี้ไม่สามารถยกเลิกได้
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeletePersonnel(person.id, person.full_name)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    ลบ
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PersonnelPage;