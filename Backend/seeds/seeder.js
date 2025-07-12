import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Stack } from '../models/Stack.js';
import { Comment } from '../models/Comment.js';
import seedData from './seed.json' assert { type: 'json' };

export class DatabaseSeeder {
  constructor() {
    this.users = [];
    this.stacks = [];
  }

  async seedDatabase() {
    try {
      console.log('🧹 Clearing existing data...');
      await this.clearDatabase();
      
      console.log('👥 Seeding users...');
      await this.seedUsers();
      
      console.log('📝 Seeding stacks...');
      await this.seedStacks();
      
      console.log('💬 Seeding comments...');
      await this.seedComments();
      
      console.log('✅ Database seeding completed successfully!');
      console.log(`Created ${this.users.length} users and ${this.stacks.length} stacks`);
    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      throw error;
    }
  }

  async clearDatabase() {
    await User.deleteMany({});
    await Stack.deleteMany({});
    await Comment.deleteMany({});
    console.log('Database cleared');
  }

  async seedUsers() {
    for (const userData of seedData.users) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      const user = new User({
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        role: userData.role || 'user',
        reputation: userData.reputation || 0
      });

      const savedUser = await user.save();
      this.users.push(savedUser);
      console.log(`✓ Created user: ${userData.username} (${userData.role})`);
    }
  }

  async seedStacks() {
    for (const stackData of seedData.stacks) {
      let creator;
      
      // Handle both creatorEmail and creatorIndex formats
      if (stackData.creatorEmail) {
        creator = this.users.find(user => user.email === stackData.creatorEmail);
      } else if (typeof stackData.creatorIndex === 'number') {
        creator = this.users[stackData.creatorIndex];
      }
      
      if (!creator) {
        console.warn(`⚠️ Creator not found for stack: ${stackData.title}`);
        // Use first user as fallback
        creator = this.users[0];
      }

      const stack = new Stack({
        title: stackData.title,
        description: stackData.description,
        tags: stackData.tags,
        creator: creator._id,
        views: stackData.views || Math.floor(Math.random() * 200) + 50,
        voteScore: stackData.voteScore || Math.floor(Math.random() * 20) - 5,
        upvotes: stackData.upvotes || Math.floor(Math.random() * 25) + 5,
        downvotes: stackData.downvotes || Math.floor(Math.random() * 8)
      });

      const savedStack = await stack.save();
      this.stacks.push(savedStack);
      console.log(`✓ Created stack: ${stackData.title.substring(0, 50)}...`);
    }
  }

  async seedComments() {
    for (const commentData of seedData.comments) {
      let author;
      let stack;
      
      // Handle both authorEmail and authorIndex formats
      if (commentData.authorEmail) {
        author = this.users.find(user => user.email === commentData.authorEmail);
      } else if (typeof commentData.authorIndex === 'number') {
        author = this.users[commentData.authorIndex];
      }
      
      // Handle stackIndex
      if (typeof commentData.stackIndex === 'number') {
        stack = this.stacks[commentData.stackIndex];
      }
      
      if (!author || !stack) {
        console.warn(`⚠️ Skipping comment due to missing author or stack`);
        continue;
      }

      const comment = new Comment({
        text: commentData.text,
        author: author._id,
        stack: stack._id,
        voteScore: Math.floor(Math.random() * 15) + 1,
        upvotes: Math.floor(Math.random() * 20) + 5,
        downvotes: Math.floor(Math.random() * 5)
      });

      const savedComment = await comment.save();
      
      // Add comment to stack
      stack.comments.push(savedComment._id);
      await stack.save();
      
      console.log(`✓ Created comment for stack: ${stack.title.substring(0, 30)}...`);
    }
  }
}

// Also export as default for compatibility
export default DatabaseSeeder;