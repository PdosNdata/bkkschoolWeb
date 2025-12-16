import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  ShoppingCart, 
  Settings, 
  Download, 
  Plus,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  FileText,
  Search,
  Filter,
  AlertCircle,
  Clock,
  Package
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Textbook {
  id: string;
  title: string;
  subject: string;
  grade_level: string;
  quantity: number;
  low_stock_threshold: number;
}

interface Transaction {
  id: string;
  transaction_id: string;
  textbook_id: string;
  action: string;
  user_name: string;
  user_type: string;
  status: string;
  created_at: string;
  textbooks?: Textbook;
}

interface Request {
  id: string;
  textbook_id: string;
  requested_by: string;
  quantity: number;
  status: string;
  textbooks?: Textbook;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'inventory', label: 'Inventory', icon: BookOpen },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'orders', label: 'Orders', icon: ShoppingCart, badge: 3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const TextbookDashboard = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [textbooks, setTextbooks] = useState<Textbook[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userName, setUserName] = useState('Admin');

  useEffect(() => {
    checkAuth();
    fetchData();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/');
      return;
    }
    
    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', session.user.id)
      .maybeSingle();
    
    if (profile?.display_name) {
      setUserName(profile.display_name);
    }
  };

  const fetchData = async () => {
    try {
      // Fetch textbooks
      const { data: textbooksData } = await supabase
        .from('textbooks')
        .select('*')
        .order('grade_level');
      
      if (textbooksData) setTextbooks(textbooksData);

      // Fetch transactions
      const { data: transactionsData } = await supabase
        .from('textbook_transactions')
        .select('*, textbooks(*)')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (transactionsData) setTransactions(transactionsData);

      // Fetch pending requests
      const { data: requestsData } = await supabase
        .from('textbook_requests')
        .select('*, textbooks(*)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (requestsData) setRequests(requestsData);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const totalStudents = 850;
  const totalBooks = textbooks.reduce((sum, book) => sum + book.quantity, 0);
  const lowStockBooks = textbooks.filter(book => book.quantity < book.low_stock_threshold);
  const pendingRequests = requests.length;

  // Prepare chart data
  const gradeOrder = ['K2', 'K3', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'M1', 'M2', 'M3'];
  const chartData = gradeOrder.map(grade => {
    const booksInGrade = textbooks.filter(book => book.grade_level === grade);
    const total = booksInGrade.reduce((sum, book) => sum + book.quantity, 0);
    const isLowStock = booksInGrade.some(book => book.quantity < book.low_stock_threshold);
    return { grade, books: total, isLowStock };
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'distributed':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Distributed</Badge>;
      case 'restock':
        return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Restock</Badge>;
      case 'lost':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Lost</Badge>;
      case 'returned':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Returned</Badge>;
      default:
        return <Badge>{action}</Badge>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'processing':
        return 'text-muted-foreground';
      case 'flagged':
        return 'text-red-400';
      case 'pending':
        return 'text-orange-400';
      default:
        return 'text-muted-foreground';
    }
  };

  const getUserTypeIcon = (type: string) => {
    switch (type) {
      case 'teacher':
        return 'T';
      case 'student':
        return 'S';
      case 'admin':
        return 'A';
      default:
        return '?';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border min-h-screen flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-foreground">Textbook Admin</h1>
              <p className="text-xs text-muted-foreground">School System</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveMenu(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeMenu === item.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
              <span className="text-foreground font-medium">A</span>
            </div>
            <div>
              <p className="font-medium text-foreground">{userName}</p>
              <button 
                onClick={() => navigate('/dashboard')}
                className="text-xs text-primary hover:underline"
              >
                กลับหน้าหลัก
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Welcome back, {userName}</h1>
            <p className="text-muted-foreground">Here is your system overview and critical alerts.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Report
            </Button>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Book
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{totalStudents.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-500">2%</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Active enrollments K2 - M3</p>
                </div>
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Books</p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    {totalBooks >= 1000 ? `${(totalBooks / 1000).toFixed(1)}k` : totalBooks}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-500">5%</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Across all grade levels</p>
                </div>
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Low Stock Alerts</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-3xl font-bold text-foreground">{lowStockBooks.length}</p>
                    {lowStockBooks.length > 0 && (
                      <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                        +{Math.min(3, lowStockBooks.length)} new
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Titles below threshold</p>
                </div>
                <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Requests</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{pendingRequests}</p>
                  <p className="text-xs text-muted-foreground mt-2">Same as yesterday</p>
                  <p className="text-xs text-muted-foreground">Teacher requisitions</p>
                </div>
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Chart */}
          <Card className="lg:col-span-2 bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-foreground">Inventory by Grade Level</CardTitle>
                  <p className="text-sm text-muted-foreground">Distribution for current semester</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <span className="text-sm text-muted-foreground">Books Available</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="grade" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="books" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.isLowStock ? 'hsl(0 84% 60%)' : 'hsl(var(--primary))'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Critical Alerts */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-400">
                <AlertCircle className="h-5 w-5" />
                Critical Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {lowStockBooks.slice(0, 2).map((book) => (
                <div key={book.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center mt-1">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-foreground text-sm">{book.title}</p>
                      <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">Low Stock</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Only {book.quantity} copies remaining. Reorder needed.
                    </p>
                  </div>
                </div>
              ))}

              {requests.slice(0, 1).map((request) => (
                <div key={request.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center mt-1">
                    <Clock className="h-4 w-4 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-foreground text-sm">{request.textbooks?.title || 'Request'}</p>
                      <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">Pending</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {request.requested_by} requested {request.quantity} copies.
                    </p>
                  </div>
                </div>
              ))}

              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mt-1">
                  <Package className="h-4 w-4 text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm">Overdue Returns</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    5 students from Grade 6 have overdue books.
                  </p>
                </div>
              </div>

              <Button variant="link" className="w-full text-primary">
                View All Alerts
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground">Recent Transactions</CardTitle>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search..." 
                    className="pl-10 w-64 bg-muted border-border"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground">DATE</TableHead>
                  <TableHead className="text-muted-foreground">TRANSACTION ID</TableHead>
                  <TableHead className="text-muted-foreground">BOOK TITLE</TableHead>
                  <TableHead className="text-muted-foreground">ACTION</TableHead>
                  <TableHead className="text-muted-foreground">USER</TableHead>
                  <TableHead className="text-muted-foreground">STATUS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length > 0 ? (
                  transactions
                    .filter(t => 
                      t.textbooks?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      t.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      t.transaction_id.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((transaction) => (
                      <TableRow key={transaction.id} className="border-border">
                        <TableCell className="text-foreground">
                          {new Date(transaction.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </TableCell>
                        <TableCell className="text-muted-foreground font-mono text-sm">
                          {transaction.transaction_id}
                        </TableCell>
                        <TableCell className="text-foreground font-medium">
                          {transaction.textbooks?.title || 'N/A'}
                        </TableCell>
                        <TableCell>{getActionBadge(transaction.action)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs font-medium text-foreground">
                              {getUserTypeIcon(transaction.user_type)}
                            </div>
                            <span className="text-foreground">{transaction.user_name}</span>
                          </div>
                        </TableCell>
                        <TableCell className={`font-medium ${getStatusColor(transaction.status)}`}>
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      ยังไม่มีรายการธุรกรรม
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default TextbookDashboard;
