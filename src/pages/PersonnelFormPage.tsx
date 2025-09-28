import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, Star } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PersonnelFormPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const personnelId = searchParams.get('id');
  const isEditing = !!personnelId;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    position: '',
    department: '',
    subjectGroup: '',
    email: '',
    phone: '',
    additionalDetails: ''
  });

  useEffect(() => {
    if (isEditing && personnelId) {
      fetchPersonnelData(personnelId);
    }
  }, [isEditing, personnelId]);

  const fetchPersonnelData = async (id: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('personnel')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          fullName: data.full_name || '',
          position: data.position || '',
          department: data.department || '',
          subjectGroup: data.subject_group || '',
          email: data.email || '',
          phone: data.phone || '',
          additionalDetails: data.additional_details || ''
        });
        
        if (data.photo_url) {
          setCurrentPhotoUrl(data.photo_url);
          setPhotoPreview(data.photo_url);
        }
      }
    } catch (error) {
      console.error('Error fetching personnel data:', error);
      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลบุคลากรได้",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPhoto = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `personnel/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading photo:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName.trim()) {
      toast({
        variant: "destructive",
        title: "กรุณากรอกข้อมูล",
        description: "กรุณากรอกชื่อ-นามสกุล",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let photoUrl = currentPhotoUrl;
      
      // Upload new photo if selected
      if (photoFile) {
        photoUrl = await uploadPhoto(photoFile);
      }

      const personnelData = {
        full_name: formData.fullName.trim(),
        position: formData.position.trim() || null,
        department: formData.department.trim() || null,
        subject_group: formData.subjectGroup || null,
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        photo_url: photoUrl,
        additional_details: formData.additionalDetails.trim() || null
      };

      let error;
      if (isEditing && personnelId) {
        // Update existing personnel
        const result = await supabase
          .from('personnel')
          .update(personnelData)
          .eq('id', personnelId);
        error = result.error;
      } else {
        // Insert new personnel
        const result = await supabase
          .from('personnel')
          .insert(personnelData);
        error = result.error;
      }

      if (error) throw error;

      toast({
        title: "สำเร็จ!",
        description: isEditing ? "แก้ไขข้อมูลบุคลากรเรียบร้อยแล้ว" : "เพิ่มข้อมูลบุคลากรเรียบร้อยแล้ว",
      });

      navigate('/personnel');
    } catch (error) {
      console.error('Error saving personnel:', error);
      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: isEditing ? "ไม่สามารถแก้ไขข้อมูลบุคลากรได้" : "ไม่สามารถเพิ่มข้อมูลบุคลากรได้",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 to-blue-50">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">ระบบจัดการข้อมูลบุคลากร</h1>
            <p className="text-gray-600">{isEditing ? 'แก้ไขข้อมูลบุคลากร' : 'เพิ่ม แก้ไข และจัดการข้อมูลบุคลากรในสถานศึกษา'}</p>
          </div>

          {/* Form Card */}
          <Card className="shadow-lg">
            <CardHeader className="bg-purple-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-300" />
                {isEditing ? 'แก้ไขข้อมูลบุคลากร' : 'เพิ่มบุคลากรใหม่'}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-6">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Required Field Note */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">
                    <Star className="w-4 h-4 inline mr-1" />
                    รายการ
                  </p>
                </div>

                {/* Photo Upload */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">รูปภาพ</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
                    {photoPreview ? (
                      <div className="space-y-4">
                        <img 
                          src={photoPreview} 
                          alt="Preview" 
                          className="max-w-32 max-h-32 rounded-lg object-contain mx-auto"
                        />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setPhotoFile(null);
                              setPhotoPreview(currentPhotoUrl);
                            }}
                          >
                            {isEditing ? 'เลือกไฟล์ใหม่' : 'เลือกไฟล์ใหม่'}
                          </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                        <div>
                          <p className="text-sm text-gray-600">เลือกไฟล์ ไม่ได้เลือกไฟล์ใด</p>
                          <p className="text-xs text-gray-500">เลือกไฟล์รูปภาพ (JPG, PNG, GIF)</p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Full Name - Required */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-medium">
                      ชื่อ-นามสกุล <Star className="w-3 h-3 inline text-red-500" />
                    </Label>
                    <Input
                      id="fullName"
                      placeholder="กรอกชื่อ-นามสกุล"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position" className="text-sm font-medium">ตำแหน่ง</Label>
                    <Input
                      id="position"
                      placeholder="เช่น ครู, ผู้อำนวยการ, รองผู้อำนวยการ"
                      value={formData.position}
                      onChange={(e) => handleInputChange('position', e.target.value)}
                    />
                  </div>
                </div>

                {/* Department and Subject Group */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-sm font-medium">แผนก/ฝ่าย</Label>
                    <Input
                      id="department"
                      placeholder="เช่น ฝ่ายวิชาการ, ฝ่ายบริหาร"
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subjectGroup" className="text-sm font-medium">
                      กลุ่มสาระการเรียนรู้ <Star className="w-3 h-3 inline text-red-500" />
                    </Label>
                    <Select 
                      value={formData.subjectGroup} 
                      onValueChange={(value) => handleInputChange('subjectGroup', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกกลุ่มสาระการเรียนรู้" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="คณิตศาสตร์">คณิตศาสตร์</SelectItem>
                        <SelectItem value="วิทยาศาสตร์และเทคโนโลยี">วิทยาศาสตร์และเทคโนโลยี</SelectItem>
                        <SelectItem value="ภาษาไทย">ภาษาไทย</SelectItem>
                        <SelectItem value="ภาษาต่างประเทศ">ภาษาต่างประเทศ</SelectItem>
                        <SelectItem value="สังคมศึกษาศาสนาและวัฒนธรรม">สังคมศึกษาศาสนาและวัฒนธรรม</SelectItem>
                        <SelectItem value="ศิลปะ">ศิลปะ</SelectItem>
                        <SelectItem value="สุขศึกษาและพลศึกษา">สุขศึกษาและพลศึกษา</SelectItem>
                        <SelectItem value="การงานอาชีพ">การงานอาชีพ</SelectItem>
                        <SelectItem value="บริหาร">บริหาร</SelectItem>
                        <SelectItem value="สนับสนุน">สนับสนุน</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Email and Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">อีเมล</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@school.ac.th"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">เบอร์โทรศัพท์</Label>
                    <Input
                      id="phone"
                      placeholder="08X-XXX-XXXX"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  </div>
                </div>

                {/* Additional Details */}
                <div className="space-y-2">
                  <Label htmlFor="additionalDetails" className="text-sm font-medium">รายละเอียดเพิ่มเติม</Label>
                  <Textarea
                    id="additionalDetails"
                    placeholder="ประวัติการศึกษา, ความเชียวชาญ, หรือข้อมูลอื่นๆ"
                    value={formData.additionalDetails}
                    onChange={(e) => handleInputChange('additionalDetails', e.target.value)}
                    rows={4}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between pt-6">
                  <Link to="/personnel">
                    <Button type="button" variant="outline" className="flex items-center">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      ย้อนกลับ
                    </Button>
                  </Link>

                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        กำลังบันทึก...
                      </div>
                    ) : (
                      <>
                        <Star className="w-4 h-4 mr-2" />
                        {isEditing ? 'บันทึกการแก้ไข' : 'เพิ่มบุคลากร'}
                      </>
                    )}
                  </Button>
                </div>
              </form>
              )}
            </CardContent>
          </Card>

          {!isEditing && (
            <Card className="mt-6 bg-gray-50 border-dashed">
              <CardContent className="p-6 text-center">
                <p className="text-gray-500 mb-2">รายการบุคลากร (0 คน)</p>
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">ยังไม่มีข้อมูลบุคลากร</p>
                  <p className="text-sm text-gray-400">เพิ่มบุคลากรใหม่เพื่อเริ่มต้นใช้งาน</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PersonnelFormPage;