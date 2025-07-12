
import {prisma } from "@/lib/prisma"
import { NextResponse } from 'next/server';

export async function GET() { 
    try {
      // Fetch Joy Pearls for General Feedback and Bug Report
      const feedbackActivity = await prisma.activity.findUnique({
        where: {
          activity: 'GENERAL_FEEDBACK',
        },
      });
      const featureActivity = await prisma.activity.findUnique({
        where: {
          activity: 'FEATURE_REQUEST',
        },
      });

      const bugReportActivity = await prisma.activity.findUnique({
        where: {
          activity: 'BUG_REPORT',
        },
      });

      if (!feedbackActivity || !bugReportActivity || !featureActivity) {
        return NextResponse.json({ message: 'Activities not found' });
      }

      return NextResponse.json({
        generalFeedbackJp: feedbackActivity.jpAmount,
        bugReportJp: bugReportActivity.jpAmount,
        featureRequestJp: featureActivity.jpAmount,
      });
    } catch (error) {
      return NextResponse.json({ message: 'Error fetching Joy Pearls', error });
    }
  }

  