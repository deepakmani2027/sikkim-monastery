"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, FileText, Upload, CheckCircle, AlertCircle, TrendingUp, Settings, Shield, Database } from "lucide-react"

export function AdminDashboard() {
  const systemStats = [
    { label: "Total Users", value: "1,247", change: "+12%", icon: Users },
    { label: "Archives", value: "342", change: "+5%", icon: FileText },
    { label: "Pending Reviews", value: "8", change: "-2%", icon: AlertCircle },
    { label: "Monthly Visits", value: "15.2K", change: "+18%", icon: TrendingUp },
  ]

  const pendingApprovals = [
    {
      id: 1,
      title: "New Monastery Documentation - Enchey",
      type: "Content Upload",
      submittedBy: "Dr. Sarah Chen",
      date: "2024-01-15",
      priority: "high",
    },
    {
      id: 2,
      title: "Manuscript Translation - Tibetan Scripts",
      type: "Research Material",
      submittedBy: "Prof. Tenzin Norbu",
      date: "2024-01-14",
      priority: "medium",
    },
    {
      id: 3,
      title: "Virtual Tour Update - Rumtek",
      type: "Media Content",
      submittedBy: "Tourism Board",
      date: "2024-01-13",
      priority: "low",
    },
  ]

  const recentActivity = [
    { action: "User registration", user: "john.doe@email.com", time: "2 hours ago" },
    { action: "Content approved", user: "admin", time: "4 hours ago" },
    { action: "Archive downloaded", user: "researcher@uni.edu", time: "6 hours ago" },
    { action: "New upload submitted", user: "content.creator@org.com", time: "8 hours ago" },
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive/10 text-destructive"
      case "medium":
        return "bg-secondary/10 text-secondary"
      case "low":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-accent/10 to-primary/10 rounded-lg p-6 monastery-pattern">
          <h2 className="text-2xl font-bold text-foreground mb-2">DharmaTech Admin Dashboard</h2>
        <p className="text-muted-foreground mb-4">
          Manage DharmaTech platform data and settings.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button className="bg-accent hover:bg-accent/90">
            <Upload className="mr-2 h-4 w-4" />
            Upload Content
          </Button>
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            System Settings
          </Button>
        </div>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {systemStats.map((stat, index) => {
          const IconComponent = stat.icon
          const isPositive = stat.change.startsWith("+")
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <IconComponent className="h-5 w-5 text-muted-foreground" />
                  <span className={`text-xs font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
                    {stat.change}
                  </span>
                </div>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks and system management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Button variant="outline" className="h-20 flex-col bg-transparent">
              <Users className="h-6 w-6 mb-2" />
              Manage Users
            </Button>
            <Button variant="outline" className="h-20 flex-col bg-transparent">
              <FileText className="h-6 w-6 mb-2" />
              Content Review
            </Button>
            <Button variant="outline" className="h-20 flex-col bg-transparent">
              <Upload className="h-6 w-6 mb-2" />
              Bulk Upload
            </Button>
            <Button variant="outline" className="h-20 flex-col bg-transparent">
              <Database className="h-6 w-6 mb-2" />
              Database
            </Button>
            <Button variant="outline" className="h-20 flex-col bg-transparent">
              <Shield className="h-6 w-6 mb-2" />
              Security
            </Button>
            <Button variant="outline" className="h-20 flex-col bg-transparent">
              <Settings className="h-6 w-6 mb-2" />
              Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Approvals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Pending Approvals
              <Badge variant="secondary">{pendingApprovals.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingApprovals.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-foreground text-sm">{item.title}</h4>
                      <Badge className={getPriorityColor(item.priority)} variant="outline">
                        {item.priority}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.type} • {item.submittedBy} • {item.date}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline">
                      Review
                    </Button>
                    <Button size="sm">
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <div className="font-medium text-foreground text-sm">{activity.action}</div>
                    <div className="text-xs text-muted-foreground">{activity.user}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">{activity.time}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>Monitor system performance and resource usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Storage Usage</span>
                <span>68%</span>
              </div>
              <Progress value={68} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Bandwidth</span>
                <span>45%</span>
              </div>
              <Progress value={45} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>API Requests</span>
                <span>23%</span>
              </div>
              <Progress value={23} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
