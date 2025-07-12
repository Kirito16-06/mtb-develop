import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma";

// api route will be /api/mark-online-offline with POST method with userId and isOnline in request body

export const POST = async(request :NextRequest)=>{
    try {
        const { userId, online } = await request.json();
        if (!userId) {
            return NextResponse.json({error:"User ID is required"}, {status:400});
        }
        if (typeof online !== 'boolean') {
            return NextResponse.json({error:"online must be a boolean"}, {status:400});
        }
        // Updating the user 's online status based on provided isOnline value either true or false
        await prisma?.user.update({
            where:{id:userId},
            data:{isOnline:online}
        });
        return NextResponse.json({success:true},{status:200});
    } catch (error) {
        console.log("Error in making user online/offline:", error);
        return NextResponse.json({error:"Error marking user online/offline"}, {status:500});
    }
}