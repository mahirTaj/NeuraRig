import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Search, Shield, User, Mail, MoreHorizontal } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User as UserType } from '@/types';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getUsers, updateUserRole } from '@/services/data-service';

// Define extended user type with additional fields
interface ExtendedUser extends UserType {
  createdAt: string;
  orders?: number;
}

const AdminUserManagement = () => {
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<ExtendedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showPromoteDialog, setShowPromoteDialog] = useState(false);
  const [showDemoteDialog, setShowDemoteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ExtendedUser | null>(null);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const userData = await getUsers();
      setUsers(userData);
      applyFilters(userData, roleFilter, searchTerm);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
        duration: 3000,
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters(users, roleFilter, searchTerm);
  }, [roleFilter, searchTerm]);

  const applyFilters = (allUsers: ExtendedUser[], role: string, search: string) => {
    let result = [...allUsers];

    // Apply role filter
    if (role !== 'all') {
      result = result.filter(user => user.role === role);
    }

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(user => 
        user.name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user._id?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredUsers(result);
  };

  const handleUpdateUserRole = async (userId: string, newRole: 'user' | 'admin') => {
    try {
      await updateUserRole(userId, newRole);
      
      // Update local state with the new role
      setUsers(prev => 
        prev.map(user => 
          user._id === userId 
            ? { ...user, role: newRole } 
            : user
        )
      );
      
      // Also update filtered users
      applyFilters(
        users.map(user => 
          user._id === userId 
            ? { ...user, role: newRole } 
            : user
        ),
        roleFilter,
        searchTerm
      );

      toast({
        title: "Success",
        description: `User role updated to ${newRole}`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-purple-500">Admin</Badge>;
      case 'user':
        return <Badge className="bg-blue-500">User</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };

  const handlePromoteUser = (user: ExtendedUser) => {
    setSelectedUser(user);
    setShowPromoteDialog(true);
  };

  const handleDemoteUser = (user: ExtendedUser) => {
    setSelectedUser(user);
    setShowDemoteDialog(true);
  };

  const confirmPromoteUser = () => {
    if (selectedUser) {
      handleUpdateUserRole(selectedUser._id, 'admin');
      setShowPromoteDialog(false);
    }
  };

  const confirmDemoteUser = () => {
    if (selectedUser) {
      handleUpdateUserRole(selectedUser._id, 'user');
      setShowDemoteDialog(false);
    }
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">User Management</CardTitle>
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchUsers}>Refresh</Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No users found matching your criteria
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">User</th>
                    <th className="text-left p-3">Email</th>
                    <th className="text-left p-3">Role</th>
                    <th className="text-left p-3">Registered On</th>
                    <th className="text-center p-3">Orders</th>
                    <th className="text-right p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">ID: {user._id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {user.email}
                        </div>
                      </td>
                      <td className="p-3">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="p-3">
                        {user.createdAt ? formatDate(user.createdAt) : 'N/A'}
                      </td>
                      <td className="p-3 text-center">
                        {user.orders || 0}
                      </td>
                      <td className="p-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {user.role === 'user' ? (
                              <DropdownMenuItem onClick={() => handlePromoteUser(user)}>
                                <Shield className="mr-2 h-4 w-4" />
                                <span>Promote to Admin</span>
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleDemoteUser(user)}>
                                <Shield className="mr-2 h-4 w-4" />
                                <span>Demote to User</span>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => window.location.href = `/admin/users/${user._id}/orders`}>
                              View Orders
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Promote User Dialog */}
      <AlertDialog open={showPromoteDialog} onOpenChange={setShowPromoteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Promote User to Admin</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to promote {selectedUser?.name} to admin? 
              This will give them full access to the admin dashboard and all management features.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmPromoteUser}
              className="bg-purple-500 hover:bg-purple-600"
            >
              Promote to Admin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Demote User Dialog */}
      <AlertDialog open={showDemoteDialog} onOpenChange={setShowDemoteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Demote Admin to Regular User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to demote {selectedUser?.name} to a regular user? 
              They will lose all admin privileges and access to the admin dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDemoteUser}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Demote to User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AdminUserManagement; 