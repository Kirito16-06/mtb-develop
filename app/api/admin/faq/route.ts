import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { question, answer } = body;

    if (!question || !answer) {
      return NextResponse.json(
        { message: 'Question and Answer are required.' },
        { status: 400 }
      );
    }

    const newFaq = await prisma.faq.create({
      data: { question, answer },
    });

    return NextResponse.json(newFaq, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to create FAQ', error },
      { status: 500 }
    );
  }
}

// update faqs
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, question, answer } = body;

    if (!id || !question || !answer) {
      return NextResponse.json(
        { message: 'ID, Question and Answer are required.' },
        { status: 400 }
      );
    }

    const updatedFaq = await prisma.faq.update({
      where: { id },
      data: { question, answer },
    });

    return NextResponse.json(updatedFaq, { status: 200 });
  } catch (error) {
    console.error('FAQ Update Error:', error);
    return NextResponse.json({ message: 'Error updating FAQ' }, { status: 500 });
  }
}




export async function DELETE(req:Request) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ message: 'ID is required' }, { status: 400 });
    }

    await prisma.faq.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'FAQ deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('FAQ Delete Error:', error);
    return NextResponse.json({ message: 'Error deleting FAQ' }, { status: 500 });
  }

}



export async function GET() {
    try {
      const faqs = await prisma.faq.findMany();
      return NextResponse.json(faqs, { status: 200 });
    } catch (error) {

      console.log(error)
      return NextResponse.json(
        { message: 'Failed to fetch FAQs', error },
        { status: 500 }
      );
    }
}

