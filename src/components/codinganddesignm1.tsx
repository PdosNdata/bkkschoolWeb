import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Code2, 
  Palette, 
  BookOpen, 
  Users, 
  Monitor, 
  Lightbulb,
  CheckCircle,
  Play,
  Download
} from 'lucide-react';

interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
}

const CodingAndDesignM1: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('intro');
  const [quizAnswers, setQuizAnswers] = useState<{ [key: string]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [progress, setProgress] = useState(0);

  const quizQuestions: QuizQuestion[] = [
    {
      id: 'q1',
      question: 'หลักการออกแบบที่สำคัญที่สุดคืออะไร?',
      options: [
        { id: 'a', text: 'ความสวยงาม', isCorrect: false },
        { id: 'b', text: 'การคำนึงถึงผู้ใช้เป็นหลัก', isCorrect: true },
        { id: 'c', text: 'ความซับซ้อน', isCorrect: false },
        { id: 'd', text: 'ราคาถูก', isCorrect: false }
      ]
    },
    {
      id: 'q2',
      question: 'วิธีการเรียนรู้การพัฒนาโปรแกรมที่มีประสิทธิภาพคือ?',
      options: [
        { id: 'a', text: 'เรียนในห้องเรียนเท่านั้น', isCorrect: false },
        { id: 'b', text: 'การฝึกปฏิบัติจริง', isCorrect: true },
        { id: 'c', text: 'อ่านหนังสือเท่านั้น', isCorrect: false },
        { id: 'd', text: 'ดูวิดีโอเท่านั้น', isCorrect: false }
      ]
    }
  ];

  const principles = [
    {
      icon: <Users className="w-6 h-6 text-primary" />,
      title: 'ความเข้าใจง่าย',
      description: 'การออกแบบที่เข้าใจง่ายและชัดเจนสำหรับผู้ใช้'
    },
    {
      icon: <Monitor className="w-6 h-6 text-primary" />,
      title: 'การใช้งานที่สะดวก',
      description: 'ผู้ใช้สามารถใช้งานได้อย่างง่ายดายและสะดวก'
    },
    {
      icon: <Lightbulb className="w-6 h-6 text-primary" />,
      title: 'การตอบสนองที่รวดเร็ว',
      description: 'ระบบตอบสนองต่อการกระทำของผู้ใช้อย่างรวดเร็ว'
    }
  ];

  const learningMethods = [
    {
      icon: <BookOpen className="w-6 h-6 text-green-600" />,
      title: 'การเรียนในห้องเรียน',
      description: 'การเรียนรู้แบบดั้งเดิมที่มีอาจารย์สอน'
    },
    {
      icon: <Monitor className="w-6 h-6 text-blue-600" />,
      title: 'การเรียนออนไลน์',
      description: 'การเรียนรู้ผ่านแพลตฟอร์มออนไลน์'
    },
    {
      icon: <Code2 className="w-6 h-6 text-purple-600" />,
      title: 'การฝึกปฏิบัติจริง',
      description: 'การลงมือทำและฝึกปฏิบัติจริง'
    }
  ];

  const handleQuizAnswer = (questionId: string, optionId: string) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleSubmitQuiz = () => {
    setShowResults(true);
    const totalQuestions = quizQuestions.length;
    const correctAnswers = quizQuestions.filter(q => {
      const userAnswer = quizAnswers[q.id];
      return q.options.find(opt => opt.id === userAnswer)?.isCorrect;
    }).length;
    setProgress((correctAnswers / totalQuestions) * 100);
  };

  const resetQuiz = () => {
    setQuizAnswers({});
    setShowResults(false);
    setProgress(0);
  };

  const downloadDocument = () => {
    const link = document.createElement('a');
    link.href = '/documents/codinganddesign.docx';
    link.download = 'การเรียนการออกแบบและเรียนโปรแกรมเบื้องต้น.docx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4 flex items-center justify-center gap-2">
            <Palette className="w-8 h-8" />
            การเรียนการออกแบบและเรียนโปรแกรมเบื้องต้น
          </h1>
          <p className="text-lg text-muted-foreground">
            เนื้อหาการเรียนรู้เกี่ยวกับการออกแบบและการพัฒนาโปรแกรมเบื้องต้น
          </p>
          <div className="flex gap-2 justify-center mt-4">
            <Badge variant="secondary">การออกแบบ</Badge>
            <Badge variant="secondary">การเขียนโปรแกรม</Badge>
            <Badge variant="secondary">การเรียนรู้</Badge>
          </div>
        </div>

        <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="intro">บทนำ</TabsTrigger>
            <TabsTrigger value="principles">หลักการออกแบบ</TabsTrigger>
            <TabsTrigger value="learning">การเรียนรู้</TabsTrigger>
            <TabsTrigger value="quiz">แบบทดสอบ</TabsTrigger>
            <TabsTrigger value="summary">สรุป</TabsTrigger>
          </TabsList>

          {/* บทนำ */}
          <TabsContent value="intro" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-primary" />
                  บทนำ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-lg leading-relaxed">
                  การออกแบบและการเรียนรู้เกี่ยวกับการพัฒนาโปรแกรมเป็นสิ่งสำคัญในยุคดิจิทัลนี้ 
                  ซึ่งมีการเปลี่ยนแปลงอย่างรวดเร็ว
                </p>
                <p className="text-muted-foreground">
                  เอกสารนี้จะช่วยให้ผู้เรียนเข้าใจถึงแนวทางการเรียนรู้และการประยุกต์ใช้ในชีวิตประจำวัน
                </p>
                <div className="flex gap-2 mt-4">
                  <Button onClick={downloadDocument} variant="outline" className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    ดาวน์โหลดเอกสาร
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* หลักการออกแบบ */}
          <TabsContent value="principles" className="space-y-6">
            <Card>
              <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-6 h-6 text-primary" />
                หลักการออกแบบ
              </CardTitle>
                <CardDescription>
                  การออกแบบที่ดีจะต้องคำนึงถึงผู้ใช้เป็นหลัก โดยมีหลักการที่สำคัญดังนี้
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  {principles.map((principle, index) => (
                    <Card key={index} className="border-2 hover:border-primary/20 transition-colors">
                      <CardContent className="p-6 text-center">
                        <div className="mb-4 flex justify-center">
                          {principle.icon}
                        </div>
                        <h3 className="font-semibold text-lg mb-2">{principle.title}</h3>
                        <p className="text-sm text-muted-foreground">{principle.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* การเรียนรู้ */}
          <TabsContent value="learning" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code2 className="w-6 h-6 text-primary" />
                  วิธีการเรียนรู้
                </CardTitle>
                <CardDescription>
                  การเรียนรู้เกี่ยวกับการพัฒนาโปรแกรมสามารถทำได้หลายวิธี
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {learningMethods.map((method, index) => (
                    <Card key={index} className="border-l-4 border-l-primary">
                      <CardContent className="p-4 flex items-center gap-4">
                        {method.icon}
                        <div>
                          <h3 className="font-semibold">{method.title}</h3>
                          <p className="text-sm text-muted-foreground">{method.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* แบบทดสอบ */}
          <TabsContent value="quiz" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-primary" />
                  แบบทดสอบความเข้าใจ
                </CardTitle>
                {showResults && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>คะแนน: {progress.toFixed(0)}%</span>
                      <Button onClick={resetQuiz} variant="outline" size="sm">
                        ทำใหม่
                      </Button>
                    </div>
                    <Progress value={progress} className="w-full" />
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {quizQuestions.map((question, qIndex) => (
                  <div key={question.id} className="space-y-3">
                    <h3 className="font-semibold">
                      {qIndex + 1}. {question.question}
                    </h3>
                    <div className="space-y-2">
                      {question.options.map((option) => {
                        const isSelected = quizAnswers[question.id] === option.id;
                        const isCorrect = option.isCorrect;
                        const showCorrect = showResults && isCorrect;
                        const showIncorrect = showResults && isSelected && !isCorrect;
                        
                        return (
                          <div
                            key={option.id}
                            className={`
                              p-3 border-2 rounded-lg cursor-pointer transition-all
                              ${isSelected ? 'border-primary bg-primary/5' : 'border-border'}
                              ${showCorrect ? 'border-green-500 bg-green-50' : ''}
                              ${showIncorrect ? 'border-red-500 bg-red-50' : ''}
                              ${!showResults ? 'hover:border-primary/50' : ''}
                            `}
                            onClick={() => !showResults && handleQuizAnswer(question.id, option.id)}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`
                                w-4 h-4 rounded-full border-2 flex items-center justify-center
                                ${isSelected ? 'border-primary bg-primary' : 'border-border'}
                                ${showCorrect ? 'border-green-500 bg-green-500' : ''}
                                ${showIncorrect ? 'border-red-500 bg-red-500' : ''}
                              `}>
                                {(isSelected || showCorrect) && (
                                  <div className="w-2 h-2 rounded-full bg-white" />
                                )}
                              </div>
                              <span>{option.text}</span>
                              {showCorrect && <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                
                {!showResults && (
                  <Button 
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(quizAnswers).length !== quizQuestions.length}
                    className="w-full"
                  >
                    ส่งคำตอบ
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* สรุป */}
          <TabsContent value="summary" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-primary" />
                  สรุป
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-lg leading-relaxed">
                  การออกแบบและการเรียนรู้เกี่ยวกับการพัฒนาโปรแกรมเป็นสิ่งที่สำคัญและจำเป็นในยุคปัจจุบัน 
                  ซึ่งจะช่วยให้ผู้เรียนสามารถพัฒนาทักษะและความรู้ได้อย่างมีประสิทธิภาพ
                </p>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground italic">
                    เอกสารนี้จัดทำขึ้นเพื่อการศึกษาและการเรียนรู้เท่านั้น
                  </p>
                </div>
                <div className="flex gap-2 mt-6">
                  <Button onClick={() => setActiveSection('intro')} variant="outline">
                    เริ่มต้นใหม่
                  </Button>
                  <Button onClick={downloadDocument} className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    ดาวน์โหลดเอกสาร
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

export default CodingAndDesignM1;