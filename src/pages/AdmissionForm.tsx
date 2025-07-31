import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, FileText, Phone, Mail, MapPin, GraduationCap, ArrowLeft } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  studentName: z.string().min(2, "กรุณาป้อนชื่อ-นามสกุลนักเรียน"),
  studentId: z.string().min(13, "กรุณาป้อนหมายเลขบัตรประชาชนให้ครบ 13 หลัก"),
  birthDate: z.string().min(1, "กรุณาเลือกวันเกิด"),
  grade: z.string().min(1, "กรุณาเลือกระดับชั้นที่สมัคร"),
  parentName: z.string().min(2, "กรุณาป้อนชื่อ-นามสกุลผู้ปกครอง"),
  parentPhone: z.string().min(10, "กรุณาป้อนหมายเลขโทรศัพท์ผู้ปกครอง"),
  parentEmail: z.string().email("กรุณาป้อนอีเมลที่ถูกต้อง"),
  address: z.string().min(10, "กรุณาป้อนที่อยู่อย่างละเอียด"),
  previousSchool: z.string().min(2, "กรุณาป้อนชื่อโรงเรียนเดิม"),
  gpa: z.string().optional(),
  specialNeeds: z.string().optional(),
});

const AdmissionForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentName: "",
      studentId: "",
      birthDate: "",
      grade: "",
      parentName: "",
      parentPhone: "",
      parentEmail: "",
      address: "",
      previousSchool: "",
      gpa: "",
      specialNeeds: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('admission_applications')
        .insert({
          student_name: values.studentName,
          student_id: values.studentId,
          birth_date: values.birthDate,
          grade: values.grade,
          parent_name: values.parentName,
          parent_phone: values.parentPhone,
          parent_email: values.parentEmail,
          address: values.address,
          previous_school: values.previousSchool,
          gpa: values.gpa || null,
          special_needs: values.specialNeeds || null,
        });

      if (error) {
        throw error;
      }
      
      toast({
        title: "ส่งใบสมัครสำเร็จ!",
        description: "เราจะติดต่อกลับภายใน 3-5 วันทำการ",
      });
      
      form.reset();
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const grades = [
    "อนุบาล 1",
    "อนุบาล 2", 
    "อนุบาล 3",
    "ประถมศึกษาปีที่ 1",
    "ประถมศึกษาปีที่ 2",
    "ประถมศึกษาปีที่ 3",
    "ประถมศึกษาปีที่ 4",
    "ประถมศึกษาปีที่ 5",
    "ประถมศึกษาปีที่ 6",
    "มัธยมศึกษาปีที่ 1",
    "มัธยมศึกษาปีที่ 2",
    "มัธยมศึกษาปีที่ 3"
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/" className="inline-flex items-center text-primary hover:text-primary/80 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              กลับหน้าหลัก
            </Link>
          </div>
          <div className="text-center">
            <Badge variant="secondary" className="mb-4">
              <GraduationCap className="w-4 h-4 mr-2" />
              สมัครเรียน
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              ใบสมัครนักเรียนปีการศึกษา 2568
            </h1>
            <p className="text-muted-foreground text-lg">
              โรงเรียนบ้านค้อดอนแคน
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="text-center bg-white/50 backdrop-blur border-0 shadow-elegant">
              <CardContent className="p-6">
                <Calendar className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">ระยะเวลารับสมัคร</h3>
                <p className="text-sm text-muted-foreground">15 ม.ค. - 28 ก.พ. 2568</p>
              </CardContent>
            </Card>
            
            <Card className="text-center bg-white/50 backdrop-blur border-0 shadow-elegant">
              <CardContent className="p-6">
                <Users className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">จำนวนที่รับ</h3>
                <p className="text-sm text-muted-foreground">จำกัดตามระดับชั้น</p>
              </CardContent>
            </Card>
            
            <Card className="text-center bg-white/50 backdrop-blur border-0 shadow-elegant">
              <CardContent className="p-6">
                <FileText className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">เอกสารที่ต้องใช้</h3>
                <p className="text-sm text-muted-foreground">ตามรายการแนบ</p>
              </CardContent>
            </Card>
          </div>

          {/* Application Form */}
          <Card className="bg-white border-0 shadow-elegant">
            <CardHeader>
              <CardTitle className="text-2xl text-center">แบบกรอกข้อมูลผู้สมัคร</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  {/* Student Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-6 flex items-center">
                      <GraduationCap className="w-5 h-5 mr-2 text-primary" />
                      ข้อมูลนักเรียน
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="studentName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ชื่อ-นามสกุลนักเรียน *</FormLabel>
                            <FormControl>
                              <Input placeholder="เช่น นาง สมใจ ใจดี" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="studentId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>หมายเลขบัตรประชาชน *</FormLabel>
                            <FormControl>
                              <Input placeholder="1234567890123" maxLength={13} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="birthDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>วันเกิด *</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="grade"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ระดับชั้นที่สมัคร *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="เลือกระดับชั้น" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {grades.map((grade) => (
                                  <SelectItem key={grade} value={grade}>
                                    {grade}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Parent Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-6 flex items-center">
                      <Users className="w-5 h-5 mr-2 text-primary" />
                      ข้อมูลผู้ปกครอง
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="parentName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ชื่อ-นามสกุลผู้ปกครอง *</FormLabel>
                            <FormControl>
                              <Input placeholder="เช่น นาย สมชาย ใจดี" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="parentPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>หมายเลขโทรศัพท์ *</FormLabel>
                            <FormControl>
                              <Input placeholder="08XXXXXXXX" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="parentEmail"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>อีเมล *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="example@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Address Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-6 flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-primary" />
                      ที่อยู่
                    </h3>
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ที่อยู่ปัจจุบัน *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="บ้านเลขที่ หมู่ ตำบล อำเภอ จังหวัด รหัสไปรษณีย์"
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Academic Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-6 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-primary" />
                      ข้อมูลการศึกษา
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="previousSchool"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>โรงเรียนเดิม *</FormLabel>
                            <FormControl>
                              <Input placeholder="ชื่อโรงเรียนที่จบมา" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="gpa"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>เกรดเฉลี่ย (ถ้ามี)</FormLabel>
                            <FormControl>
                              <Input placeholder="เช่น 3.50" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Special Needs */}
                  <div>
                    <FormField
                      control={form.control}
                      name="specialNeeds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ความต้องการพิเศษ (ถ้ามี)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="เช่น ความบกพร่องทางการเรียนรู้ ความต้องการสนับสนุนพิเศษ"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="text-center pt-6">
                    <Button 
                      type="submit" 
                      size="lg" 
                      disabled={isSubmitting}
                      className="px-12"
                    >
                      {isSubmitting ? "กำลังส่งใบสมัคร..." : "ส่งใบสมัคร"}
                    </Button>
                    <p className="text-sm text-muted-foreground mt-4">
                      * กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนส่งใบสมัคร
                    </p>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Required Documents */}
          <Card className="mt-8 bg-white border-0 shadow-elegant">
            <CardHeader>
              <CardTitle>เอกสารประกอบการสมัคร</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  สำเนาบัตรประชาชนนักเรียนและผู้ปกครอง
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  สำเนาทะเบียนบ้าน
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  ใบแสดงผลการเรียน (ถ้ามี)
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  รูปถ่าย 1 นิ้ว จำนวน 2 รูป
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  หนังสือรับรองจากโรงเรียนเดิม (สำหรับนักเรียนโอน)
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdmissionForm;