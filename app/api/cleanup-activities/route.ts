import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseStorage } from '@/src/services/storage/supabase'

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseStorage()
    
    // Update ALL stale activities (in_progress or pending) to 'failed' status
    const { error: updateError } = await supabase
      .from('activities')
      .update({ 
        status: 'failed',
        description: 'Activity timed out and was cleaned up'
      })
      .in('status', ['in_progress', 'pending'])
    
    if (updateError) {
      // Error: Failed to update stale activities
      return NextResponse.json({ error: 'Failed to cleanup activities' }, { status: 500 })
    }
    
    // Also clean up very old completed activities (older than 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    
    const { error: deleteError } = await supabase
      .from('activities')
      .delete()
      .eq('status', 'completed')
      .lt('created_at', oneHourAgo)
    
    if (deleteError) {
      // Error: Failed to delete old completed activities
    }
    
    // Get current activity counts
    const { data: activities, error: countError } = await supabase
      .from('activities')
      .select('status')
    
    if (countError) {
      // Error: Failed to get activity counts
      return NextResponse.json({ error: 'Failed to get activity counts' }, { status: 500 })
    }
    
    const statusCounts = activities?.reduce((acc, activity) => {
      acc[activity.status] = (acc[activity.status] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}
    
    const activeCount = (statusCounts['in_progress'] || 0) + (statusCounts['pending'] || 0)
    
    return NextResponse.json({
      success: true,
      message: 'Activities cleaned up successfully',
      activeCount,
      statusCounts
    })
    
  } catch (error: unknown) {
    console.error('Activity cleanup error', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error.message || 'An unexpected error occurred'
    }, { status: 500 })
  }
}
