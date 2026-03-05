import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../scheme/user.schema';
import { Course, CourseDocument } from '../../scheme/course.schema';
import { Session, SessionDocument } from '../../scheme/session.schema';
import { Review, ReviewDocument } from '../../scheme/review.schema';
import { Conversation, ConversationDocument } from '../../scheme/conversation.schema';
import { ChatMessage, ChatMessageDocument } from '../../scheme/chat-message.schema';
import { DashboardStatsDto } from './dto/dashboard.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
    @InjectModel(ChatMessage.name) private messageModel: Model<ChatMessageDocument>,
  ) {}

  async getDashboardStats(): Promise<DashboardStatsDto> {
    const [
      totalUsers,
      totalCourses,
      totalSessions,
      totalReviews,
      totalConversations,
      totalMessages,
      averageRating,
      activeUsersToday,
      newUsersThisWeek,
      userGrowthData,
      courseGrowthData,
      sessionGrowthData,
      reviewGrowthData,
    ] = await Promise.all([
      this.userModel.countDocuments(),
      this.courseModel.countDocuments(),
      this.sessionModel.countDocuments(),
      this.reviewModel.countDocuments(),
      this.conversationModel.countDocuments(),
      this.messageModel.countDocuments(),
      this.getAverageRating(),
      this.getActiveUsersToday(),
      this.getNewUsersThisWeek(),
      this.getUserGrowthData(),
      this.getCourseGrowthData(),
      this.getSessionGrowthData(),
      this.getReviewGrowthData(),
    ]);

    // Calculate growth percentages
    const userGrowthPercentage = this.calculateGrowthPercentage(userGrowthData);
    const courseGrowthPercentage = this.calculateGrowthPercentage(courseGrowthData);
    const sessionGrowthPercentage = this.calculateGrowthPercentage(sessionGrowthData);
    const reviewGrowthPercentage = this.calculateGrowthPercentage(reviewGrowthData);

    return {
      totalUsers,
      totalCourses,
      totalSessions,
      totalReviews,
      totalConversations,
      totalMessages,
      userGrowthPercentage,
      courseGrowthPercentage,
      sessionGrowthPercentage,
      reviewGrowthPercentage,
      averageRating,
      activeUsersToday,
      newUsersThisWeek,
    };
  }

  async getUserGrowthData(): Promise<{ date: string; count: number }[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const pipeline = [
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 as 1 }
      }
    ];

    const result = await this.userModel.aggregate(pipeline);
    return result.map(item => ({
      date: item._id,
      count: item.count
    }));
  }

  async getCourseEnrollmentData(): Promise<{ course: string; enrollments: number }[]> {
    const pipeline = [
      {
        $lookup: {
          from: 'users',
          localField: 'students',
          foreignField: '_id',
          as: 'enrolledStudents'
        }
      },
      {
        $project: {
          title: 1,
          enrollmentCount: { $size: '$enrolledStudents' }
        }
      },
      {
        $sort: { enrollmentCount: -1 as -1 }
      },
      {
        $limit: 10
      }
    ];

    const result = await this.courseModel.aggregate(pipeline);
    return result.map(item => ({
      course: item.title,
      enrollments: item.enrollmentCount
    }));
  }

  async getChatActivityData(): Promise<{ date: string; messages: number; conversations: number }[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [messageData, conversationData] = await Promise.all([
      this.messageModel.aggregate([
        {
          $match: {
            createdAt: { $gte: sevenDaysAgo }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt"
              }
            },
            messages: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 as 1 }
        }
      ]),
      this.conversationModel.aggregate([
        {
          $match: {
            createdAt: { $gte: sevenDaysAgo }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt"
              }
            },
            conversations: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 as 1 }
        }
      ])
    ]);

    // Merge the data by date
    const dateMap = new Map();
    
    messageData.forEach(item => {
      dateMap.set(item._id, { date: item._id, messages: item.messages, conversations: 0 });
    });
    
    conversationData.forEach(item => {
      if (dateMap.has(item._id)) {
        dateMap.get(item._id).conversations = item.conversations;
      } else {
        dateMap.set(item._id, { date: item._id, messages: 0, conversations: item.conversations });
      }
    });

    return Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }

  async getReviewTrendsData(): Promise<{ date: string; reviews: number; averageRating: number }[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const pipeline = [
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            }
          },
          reviews: { $sum: 1 },
          averageRating: { $avg: "$rating" }
        }
      },
      {
        $sort: { _id: 1 as 1 }
      }
    ];

    const result = await this.reviewModel.aggregate(pipeline);
    return result.map(item => ({
      date: item._id,
      reviews: item.reviews,
      averageRating: Math.round(item.averageRating * 10) / 10
    }));
  }

  private async getAverageRating(): Promise<number> {
    const result = await this.reviewModel.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" }
        }
      }
    ]);

    return result.length > 0 ? Math.round(result[0].averageRating * 10) / 10 : 0;
  }

  private async getActiveUsersToday(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.userModel.countDocuments({
      lastLoginAt: {
        $gte: today,
        $lt: tomorrow
      }
    });
  }

  private async getNewUsersThisWeek(): Promise<number> {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    return this.userModel.countDocuments({
      createdAt: { $gte: weekAgo }
    });
  }

  private async getCourseGrowthData(): Promise<{ date: string; count: number }[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const pipeline = [
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 as 1 }
      }
    ];

    const result = await this.courseModel.aggregate(pipeline);
    return result.map(item => ({
      date: item._id,
      count: item.count
    }));
  }

  private async getSessionGrowthData(): Promise<{ date: string; count: number }[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const pipeline = [
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 as 1 }
      }
    ];

    const result = await this.sessionModel.aggregate(pipeline);
    return result.map(item => ({
      date: item._id,
      count: item.count
    }));
  }

  private async getReviewGrowthData(): Promise<{ date: string; count: number }[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const pipeline = [
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 as 1 }
      }
    ];

    const result = await this.reviewModel.aggregate(pipeline);
    return result.map(item => ({
      date: item._id,
      count: item.count
    }));
  }

  private calculateGrowthPercentage(data: { date: string; count: number }[]): number {
    if (data.length < 2) return 0;
    
    const firstWeek = data.slice(0, 7).reduce((sum, item) => sum + item.count, 0);
    const lastWeek = data.slice(-7).reduce((sum, item) => sum + item.count, 0);
    
    if (firstWeek === 0) return lastWeek > 0 ? 100 : 0;
    
    return Math.round(((lastWeek - firstWeek) / firstWeek) * 100 * 10) / 10;
  }

  async getRecentActivities(): Promise<any[]> {
    const activities = [];

    try {
      // Get recent reviews first (most reliable data)
      const recentReviews = await this.reviewModel.aggregate([
        {
          $match: {
            userId: { $exists: true, $ne: null },
            courseId: { $exists: true, $ne: null }
          }
        },
        {
          $sort: { createdAt: -1 as -1 }
        },
        {
          $limit: 15
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'userInfo'
          }
        },
        {
          $lookup: {
            from: 'courses',
            localField: 'courseId',
            foreignField: '_id',
            as: 'courseInfo'
          }
        },
        {
          $match: {
            'userInfo.0': { $exists: true },
            'courseInfo.0': { $exists: true }
          }
        },
        {
          $project: {
            user: { $arrayElemAt: ['$userInfo.name', 0] },
            action: 'left_review',
            course: { $arrayElemAt: ['$courseInfo.title', 0] },
            createdAt: '$createdAt',
            status: 'processing'
          }
        }
      ]);

      activities.push(...recentReviews);

      // Get recent chat conversations
      const recentChats = await this.conversationModel.aggregate([
        {
          $match: {
            userId: { $exists: true, $ne: null },
            title: { $exists: true, $ne: null, $nin: [''] }
          }
        },
        {
          $sort: { createdAt: -1 as -1 }
        },
        {
          $limit: 15
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'userInfo'
          }
        },
        {
          $match: {
            'userInfo.0': { $exists: true }
          }
        },
        {
          $project: {
            user: { $arrayElemAt: ['$userInfo.name', 0] },
            action: 'started_chat',
            course: '$title',
            createdAt: '$createdAt',
            status: 'default'
          }
        }
      ]);

      activities.push(...recentChats);

      // Get recent course enrollments (simplified approach)
      const recentEnrollments = await this.courseModel.aggregate([
        {
          $match: {
            students: { $exists: true, $ne: [] },
            title: { $exists: true, $ne: null, $nin: [''] }
          }
        },
        {
          $sort: { updatedAt: -1 as -1 }
        },
        {
          $limit: 10
        },
        {
          $unwind: {
            path: '$students',
            preserveNullAndEmptyArrays: false
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'students',
            foreignField: '_id',
            as: 'userInfo'
          }
        },
        {
          $match: {
            'userInfo.0': { $exists: true }
          }
        },
        {
          $project: {
            user: { $arrayElemAt: ['$userInfo.name', 0] },
            action: 'enrolled_course',
            course: '$title',
            createdAt: '$updatedAt',
            status: 'success'
          }
        }
      ]);

      activities.push(...recentEnrollments);

      // Filter and validate activities
      const validActivities = activities.filter(activity => 
        activity.user && 
        activity.user.trim() !== '' && 
        activity.course && 
        activity.course.trim() !== '' &&
        activity.createdAt
      );

      // Sort all activities by createdAt and take top 20
      const sortedActivities = validActivities
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 20)
        .map((activity, index) => ({
          key: index.toString(),
          user: activity.user.trim(),
          action: activity.action,
          course: activity.course.trim(),
          time: this.formatTimeAgo(activity.createdAt),
          createdAt: activity.createdAt,
          status: activity.status
        }));

      console.log('Recent activities found:', sortedActivities.length);
      
      // If no real data, return demo data
      if (sortedActivities.length === 0) {
        return this.getDemoActivities();
      }
      
      return sortedActivities;
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      return this.getDemoActivities();
    }
  }

  private formatTimeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} ngày trước`;
    if (hours > 0) return `${hours} giờ trước`;
    if (minutes > 0) return `${minutes} phút trước`;
    return 'Vừa xong';
  }

  async debugActivities(): Promise<any> {
    try {
      const stats = {
        totalUsers: await this.userModel.countDocuments(),
        totalCourses: await this.courseModel.countDocuments(),
        totalReviews: await this.reviewModel.countDocuments(),
        totalConversations: await this.conversationModel.countDocuments(),
        recentReviews: await this.reviewModel.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
        recentConversations: await this.conversationModel.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } })
      };

      const sampleData = {
        sampleUsers: await this.userModel.find().limit(3).select('name email'),
        sampleCourses: await this.courseModel.find().limit(3).select('title students'),
        sampleReviews: await this.reviewModel.find().limit(3).select('userId courseId createdAt'),
        sampleConversations: await this.conversationModel.find().limit(3).select('userId title createdAt')
      };

      return { stats, sampleData };
    } catch (error) {
      console.error('Debug activities error:', error);
      return { error: error.message };
    }
  }

  private getDemoActivities(): any[] {
    const now = new Date();
    return [
      {
        key: "1",
        user: "Nguyễn Văn An",
        action: "enrolled_course",
        course: "React Native từ A-Z",
        time: "2 giờ trước",
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        status: "success"
      },
      {
        key: "2",
        user: "Trần Thị Bình",
        action: "left_review",
        course: "JavaScript Fundamentals",
        time: "4 giờ trước",
        createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
        status: "processing"
      },
      {
        key: "3",
        user: "Lê Minh Cường",
        action: "started_chat",
        course: "Python Basics",
        time: "6 giờ trước",
        createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
        status: "default"
      },
      {
        key: "4",
        user: "Phạm Thị Dung",
        action: "enrolled_course",
        course: "Web Development",
        time: "1 ngày trước",
        createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        status: "success"
      },
      {
        key: "5",
        user: "Hoàng Văn Em",
        action: "left_review",
        course: "Node.js Backend",
        time: "2 ngày trước",
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        status: "processing"
      }
    ];
  }
}
