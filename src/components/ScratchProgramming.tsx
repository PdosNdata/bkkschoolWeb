import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Code2, 
  Play, 
  BookOpen, 
  Trophy, 
  Download,
  ChevronRight,
  CheckCircle,
  Brain,
  Gamepad2,
  Target
} from "lucide-react";
import scratchCover from "@/assets/scratch-programming-cover.jpg";

const ScratchProgramming = () => {
  const [activeTab, setActiveTab] = useState('intro');
  const [quizAnswers, setQuizAnswers] = useState<{ [key: string]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [quizProgress, setQuizProgress] = useState(0);

  const quizQuestions = [
    {
      id: 'q1',
      question: 'Scratch คืออะไร?',
      options: [
        { id: 'a', text: 'ภาษาโปรแกรมที่ใช้ข้อความ', isCorrect: false },
        { id: 'b', text: 'ภาษาโปรแกรมแบบลากและวาง', isCorrect: true },
        { id: 'c', text: 'เกมคอมพิวเตอร์', isCorrect: false },
        { id: 'd', text: 'โปรแกรมวาดรูป', isCorrect: false }
      ]
    },
    {
      id: 'q2',
      question: 'บล็อกใน Scratch ทำหน้าที่อะไร?',
      options: [
        { id: 'a', text: 'ตกแต่งโปรแกรม', isCorrect: false },
        { id: 'b', text: 'สร้างคำสั่งและควบคุมการทำงาน', isCorrect: true },
        { id: 'c', text: 'เปลี่ยนสี', isCorrect: false },
        { id: 'd', text: 'เล่นเสียง', isCorrect: false }
      ]
    },
    {
      id: 'q3',
      question: 'Sprite ใน Scratch คืออะไร?',
      options: [
        { id: 'a', text: 'เสียงดนตรี', isCorrect: false },
        { id: 'b', text: 'พื้นหลังของเกม', isCorrect: false },
        { id: 'c', text: 'ตัวละครหรือวัตถุที่สามารถควบคุมได้', isCorrect: true },
        { id: 'd', text: 'บล็อกคำสั่ง', isCorrect: false }
      ]
    }
  ];

  const handleQuizAnswer = (questionId: string, optionId: string) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleSubmitQuiz = () => {
    const correct = quizQuestions.filter(q => {
      const userAnswer = quizAnswers[q.id];
      return q.options.find(opt => opt.id === userAnswer)?.isCorrect;
    }).length;
    
    const percentage = Math.round((correct / quizQuestions.length) * 100);
    setQuizProgress(percentage);
    setShowResults(true);
  };

  const resetQuiz = () => {
    setQuizAnswers({});
    setShowResults(false);
    setQuizProgress(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/20 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-4">
            <Code2 className="w-4 h-4 mr-2" />
            บทเรียนโปรแกรมมิ่ง
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            พัฒนาทักษะการเขียนโปรแกรมเบื้องต้นด้วย Scratch
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            เรียนรู้พื้นฐานการเขียนโปรแกรมด้วย Scratch อย่างสนุกและเข้าใจง่าย
          </p>
        </div>

        {/* Cover Image */}
        <div className="mb-8">
          <Card className="overflow-hidden">
            <img 
              src={scratchCover} 
              alt="Scratch Programming Cover" 
              className="w-full h-64 md:h-80 object-cover"
            />
          </Card>
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="intro">เริ่มต้น</TabsTrigger>
            <TabsTrigger value="basics">พื้นฐาน</TabsTrigger>
            <TabsTrigger value="blocks">บล็อก</TabsTrigger>
            <TabsTrigger value="quiz">แบบทดสอบ</TabsTrigger>
            <TabsTrigger value="summary">สรุป</TabsTrigger>
          </TabsList>

          <TabsContent value="intro" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="w-6 h-6 mr-2 text-primary" />
                  แนะนำ Scratch
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Scratch เป็นภาษาโปรแกรมที่ออกแบบมาเพื่อการเรียนรู้ โดยใช้วิธีการลากและวางบล็อกคำสั่ง 
                  ทำให้ผู้เรียนสามารถเข้าใจแนวคิดการเขียนโปรแกรมได้อย่างง่ายดาย
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-accent/20">
                    <Brain className="w-8 h-8 text-primary" />
                    <div>
                      <h4 className="font-semibold">พัฒนาการคิด</h4>
                      <p className="text-sm text-muted-foreground">เสริมสร้างการคิดเชิงตรรกะ</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-accent/20">
                    <Gamepad2 className="w-8 h-8 text-primary" />
                    <div>
                      <h4 className="font-semibold">เรียนรู้แบบเกม</h4>
                      <p className="text-sm text-muted-foreground">สนุกและเข้าใจง่าย</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-accent/20">
                    <Target className="w-8 h-8 text-primary" />
                    <div>
                      <h4 className="font-semibold">เป้าหมายชัดเจน</h4>
                      <p className="text-sm text-muted-foreground">เรียนรู้ทีละขั้นตอน</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="basics" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Play className="w-6 h-6 mr-2 text-primary" />
                  พื้นฐาน Scratch
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-semibold text-lg">1. Sprite (ตัวละคร)</h4>
                    <p className="text-muted-foreground">
                      ตัวละครหรือวัตถุที่เราสามารถควบคุมการเคลื่อนไหวและพฤติกรรมได้
                    </p>
                  </div>
                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-semibold text-lg">2. Stage (เวที)</h4>
                    <p className="text-muted-foreground">
                      พื้นที่ที่ตัวละครจะแสดงและทำกิจกรรมต่างๆ
                    </p>
                  </div>
                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-semibold text-lg">3. Script (สคริปต์)</h4>
                    <p className="text-muted-foreground">
                      ชุดคำสั่งที่เขียนขึ้นเพื่อควบคุมการทำงานของตัวละคร
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="blocks" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Code2 className="w-6 h-6 mr-2 text-primary" />
                  ประเภทของบล็อก
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <h4 className="font-semibold text-blue-800">Motion (การเคลื่อนไหว)</h4>
                    <p className="text-blue-600 text-sm">ควบคุมการเคลื่อนที่ของตัวละคร</p>
                  </div>
                  <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                    <h4 className="font-semibold text-purple-800">Looks (รูปลักษณ์)</h4>
                    <p className="text-purple-600 text-sm">เปลี่ยนรูปลักษณ์และเอฟเฟกต์</p>
                  </div>
                  <div className="p-4 rounded-lg bg-pink-50 border border-pink-200">
                    <h4 className="font-semibold text-pink-800">Sound (เสียง)</h4>
                    <p className="text-pink-600 text-sm">เล่นเสียงและดนตรี</p>
                  </div>
                  <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                    <h4 className="font-semibold text-yellow-800">Events (เหตุการณ์)</h4>
                    <p className="text-yellow-600 text-sm">เริ่มต้นการทำงานของสคริปต์</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quiz" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="w-6 h-6 mr-2 text-primary" />
                  แบบทดสอบความเข้าใจ
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!showResults ? (
                  <div className="space-y-6">
                    {quizQuestions.map((question, index) => (
                      <div key={question.id} className="space-y-3">
                        <h4 className="font-semibold">
                          {index + 1}. {question.question}
                        </h4>
                        <div className="space-y-2">
                          {question.options.map((option) => (
                            <label key={option.id} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="radio"
                                name={question.id}
                                value={option.id}
                                onChange={() => handleQuizAnswer(question.id, option.id)}
                                className="text-primary"
                              />
                              <span>{option.text}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                    <Button 
                      onClick={handleSubmitQuiz}
                      disabled={Object.keys(quizAnswers).length < quizQuestions.length}
                      className="w-full"
                    >
                      ส่งคำตอบ
                    </Button>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                      <Trophy className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">ผลการทดสอบ</h3>
                    <p className="text-2xl font-bold text-primary">{quizProgress}%</p>
                    <p className="text-muted-foreground">
                      {quizProgress >= 70 ? 'ยินดีด้วย! คุณผ่านการทดสอบ' : 'ลองทำใหม่อีกครั้ง'}
                    </p>
                    <Button onClick={resetQuiz} variant="outline">
                      ทำแบบทดสอบใหม่
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="w-6 h-6 mr-2 text-primary" />
                  สรุปบทเรียน
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  คุณได้เรียนรู้พื้นฐานการเขียนโปรแกรมด้วย Scratch แล้ว รวมถึง:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    แนวคิดพื้นฐานของ Scratch
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    ส่วนประกอบสำคัญ (Sprite, Stage, Script)
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    ประเภทของบล็อกคำสั่ง
                  </li>
                </ul>
                <div className="flex space-x-4 pt-4">
                  <Button onClick={() => setActiveTab('quiz')}>
                    <Trophy className="w-4 h-4 mr-2" />
                    ทำแบบทดสอบ
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ScratchProgramming;