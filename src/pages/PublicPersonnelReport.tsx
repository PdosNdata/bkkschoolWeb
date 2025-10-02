import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, FileText, UserCheck, Mail, Phone, Building, Grid3X3, List } from "lucide-react";
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
interface GroupedPersonnel {
  [key: string]: Personnel[];
}
const PublicPersonnelReport = () => {
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [groupedPersonnel, setGroupedPersonnel] = useState<GroupedPersonnel>({});
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedPersonnel, setSelectedPersonnel] = useState<Personnel | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const {
    toast
  } = useToast();
  useEffect(() => {
    fetchPersonnel();
  }, []);
  const fetchPersonnel = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('personnel').select('*').order('subject_group', {
        ascending: true
      });
      if (error) throw error;
      const personnelData = data || [];
      setPersonnel(personnelData);

      // Group personnel by subject_group
      const grouped = personnelData.reduce((acc: GroupedPersonnel, person) => {
        const group = person.subject_group || 'ไม่ระบุกลุ่มสาระ';
        if (!acc[group]) {
          acc[group] = [];
        }
        acc[group].push(person);
        return acc;
      }, {});
      setGroupedPersonnel(grouped);
    } catch (error) {
      console.error('Error fetching personnel:', error);
      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลบุคลากรได้"
      });
    } finally {
      setLoading(false);
    }
  };
  const handlePersonnelClick = (person: Personnel) => {
    setSelectedPersonnel(person);
    setDialogOpen(true);
  };
  const subjectGroups = Object.keys(groupedPersonnel);
  const totalPersonnel = personnel.length;
  return <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 to-blue-50">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 mb-8 text-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">บุคลากรแยกตามกลุ่มสาระการเรียนรู้</h1>
                <p className="text-purple-100">
                  รายการบุคลากรทั้งหมด {totalPersonnel} คน จัดแยกตามกลุ่มสาระการเรียนรู้
                </p>
              </div>
              <div className="flex gap-3">
                <div className="flex bg-white/10 rounded-lg border border-white/20 overflow-hidden">
                  <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('grid')} className={`rounded-none border-0 ${viewMode === 'grid' ? 'bg-white text-purple-600' : 'text-white hover:bg-white/20'}`}>
                    <Grid3X3 className="w-4 h-4 mr-1" />
                    การ์ด
                  </Button>
                  <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('list')} className={`rounded-none border-0 ${viewMode === 'list' ? 'bg-white text-purple-600' : 'text-white hover:bg-white/20'}`}>
                    <List className="w-4 h-4 mr-1" />
                    รายการ
                  </Button>
                </div>
                <div className="bg-white/10 px-4 py-2 rounded-lg border border-white/20">
                  <span className="text-sm font-medium">แสดง {subjectGroups.length} กลุ่มสาระ</span>
                </div>
              </div>
            </div>
          </div>

          {/* Report Content */}
          {loading ? <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div> : totalPersonnel === 0 ? (/* Empty State */
        <Card className="text-center py-16">
              <CardContent>
                <div className="w-24 h-24 mx-auto mb-6 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="w-12 h-12 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  ยังไม่มีข้อมูลบุคลากร
                </h3>
                <p className="text-gray-500">
                  ยังไม่มีข้อมูลบุคลากรในระบบ
                </p>
              </CardContent>
            </Card>) : (/* Report Data */
        <div className="space-y-6">
              {subjectGroups.map(group => <Card key={group} className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-purple-600" />
                        {group}
                      </CardTitle>
                      <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                        {groupedPersonnel[group].length} คน
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {viewMode === 'grid' ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                        {groupedPersonnel[group].map(person => <div key={person.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => handlePersonnelClick(person)}>
                            <div className="flex flex-col items-center text-center space-y-3">
                              {person.photo_url ? <img src={person.photo_url} alt={person.full_name} className="w-20 h-20 rounded-lg object-cover" /> : <div className="w-20 h-20 rounded-lg bg-purple-100 flex items-center justify-center">
                                  <UserCheck className="w-10 h-10 text-purple-600" />
                                </div>}
                              <div className="w-full">
                                <h4 className="font-semibold text-gray-900 text-sm mb-1">
                                  {person.full_name}
                                </h4>
                                {person.position && <p className="text-sm text-purple-600 font-medium mb-2">
                                    {person.position}
                                  </p>}
                                <div className="space-y-1 text-left">
                                  {person.department && <div className="flex items-center text-xs text-gray-600">
                                      <Building className="w-3 h-3 mr-2 flex-shrink-0" />
                                      <span className="truncate">{person.department}</span>
                                    </div>}
                                  {person.email && <div className="flex items-center text-xs text-gray-600">
                                      <Mail className="w-3 h-3 mr-2 flex-shrink-0" />
                                      <span className="truncate">{person.email}</span>
                                    </div>}
                                  {person.phone && <div className="flex items-center text-xs text-gray-600">
                                      <Phone className="w-3 h-3 mr-2 flex-shrink-0" />
                                      <span className="truncate">{person.phone}</span>
                                    </div>}
                                </div>
                              </div>
                            </div>
                          </div>)}
                      </div> : <div className="divide-y divide-gray-200">
                        {groupedPersonnel[group].map(person => <div key={person.id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handlePersonnelClick(person)}>
                            <div className="flex items-center space-x-4">
                              {person.photo_url ? <img src={person.photo_url} alt={person.full_name} className="w-12 h-12 rounded-lg object-cover" /> : <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                                  <UserCheck className="w-6 h-6 text-purple-600" />
                                </div>}
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">
                                  {person.full_name}
                                </h4>
                                {person.position && <p className="text-sm text-purple-600 font-medium">
                                    {person.position}
                                  </p>}
                                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                                  {person.department && <div className="flex items-center">
                                      <Building className="w-3 h-3 mr-1" />
                                      <span>{person.department}</span>
                                    </div>}
                                  {person.email && <div className="flex items-center">
                                      <Mail className="w-3 h-3 mr-1" />
                                      <span>{person.email}</span>
                                    </div>}
                                  {person.phone && <div className="flex items-center">
                                      <Phone className="w-3 h-3 mr-1" />
                                      <span>{person.phone}</span>
                                    </div>}
                                </div>
                              </div>
                            </div>
                          </div>)}
                      </div>}
                  </CardContent>
                </Card>)}
            </div>)}
        </div>
      </main>

      {/* Image Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-purple-800">
              {selectedPersonnel?.full_name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedPersonnel?.photo_url ? <div className="w-full flex justify-center">
                <img src={selectedPersonnel.photo_url} alt={selectedPersonnel.full_name} className="max-w-full max-h-96 object-contain rounded-lg" />
              </div> : <div className="w-full h-96 bg-purple-100 flex items-center justify-center rounded-lg">
                <UserCheck className="w-32 h-32 text-purple-600" />
              </div>}
            <div className="space-y-3 bg-purple-50 p-4 rounded-lg">
              {selectedPersonnel?.position && <div className="flex items-start">
                  <span className="font-semibold text-purple-800 min-w-[120px]">ตำแหน่ง:</span>
                  <span className="text-gray-800">{selectedPersonnel.position}</span>
                </div>}
              {selectedPersonnel?.department && <div className="flex items-start">
                  <Building className="w-5 h-5 mr-2 text-purple-600 mt-0.5" />
                  <span className="font-semibold text-purple-800 min-w-[100px]">แผนก:</span>
                  <span className="text-gray-800">{selectedPersonnel.department}</span>
                </div>}
              {selectedPersonnel?.subject_group && <div className="flex items-start">
                  <span className="font-semibold text-purple-800 min-w-[120px]">กลุ่มสาระ:</span>
                  <span className="text-gray-800">{selectedPersonnel.subject_group}</span>
                </div>}
              {selectedPersonnel?.email && <div className="flex items-start">
                  <Mail className="w-5 h-5 mr-2 text-purple-600 mt-0.5" />
                  <span className="font-semibold text-purple-800 min-w-[100px]">อีเมล:</span>
                  <span className="text-gray-800 break-all">{selectedPersonnel.email}</span>
                </div>}
              {selectedPersonnel?.phone && <div className="flex items-start">
                  <Phone className="w-5 h-5 mr-2 text-purple-600 mt-0.5" />
                  <span className="font-semibold text-purple-800 min-w-[100px]">เบอร์โทร:</span>
                  <span className="text-gray-800">{selectedPersonnel.phone}</span>
                </div>}
              {selectedPersonnel?.additional_details && <div className="flex items-start">
                  <span className="font-semibold text-purple-800 min-w-[120px]">รายละเอียดเพิ่มเติม:</span>
                  <span className="text-gray-800">{selectedPersonnel.additional_details}</span>
                </div>}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>;
};
export default PublicPersonnelReport;