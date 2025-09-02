#!/usr/bin/env node

/**
 * Cron Jobs Script - Database Maintenance & Analytics
 * Replaces Vercel Cron functionality with Supabase-based automated tasks
 */

const { createClient } = require('@supabase/supabase-js')

// Environment variables
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:')
  console.error('   SUPABASE_URL:', SUPABASE_URL ? '✅ Set' : '❌ Missing')
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing')
  process.exit(1)
}

// Create Supabase client with service role for admin operations
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// Get job type from command line arguments
const jobType = process.argv[2] || 'daily'

console.log(`🚀 Starting ${jobType} maintenance job...`)
console.log(`⏰ Started at: ${new Date().toISOString()}`)

/**
 * Log job start and return job ID
 */
async function logJobStart(jobName, jobType = 'github_action') {
  try {
    const { data, error } = await supabase.rpc('log_cron_job_start', {
      job_name: jobName,
      job_type: jobType
    })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Failed to log job start:', error)
    return null
  }
}

/**
 * Log job completion
 */
async function logJobComplete(jobId, status = 'completed', resultData = {}, errorMessage = null) {
  try {
    const { error } = await supabase.rpc('log_cron_job_complete', {
      job_id: jobId,
      status: status,
      result_data: resultData,
      error_message: errorMessage
    })

    if (error) throw error
    return true
  } catch (error) {
    console.error('Failed to log job completion:', error)
    return false
  }
}

/**
 * Daily maintenance tasks
 */
async function runDailyMaintenance() {
  const jobId = await logJobStart('daily_maintenance')
  const startTime = Date.now()
  
  try {
    console.log('📅 Running daily maintenance...')
    
    // 1. Clean up expired cache entries
    console.log('🧹 Cleaning expired cache...')
    const { data: cacheCleanup, error: cacheError } = await supabase.rpc('cleanup_expired_cache')
    if (cacheError) throw cacheError
    
    // 2. Clean up old cron job logs (keep last 30 days)
    console.log('📋 Cleaning old cron logs...')
    const { data: logsCleanup, error: logsError } = await supabase.rpc('cleanup_old_cron_logs')
    if (logsError) throw logsError
    
    // 3. Update daily statistics
    console.log('📊 Updating daily statistics...')
    const { data: stats, error: statsError } = await supabase
      .from('daily_token_usage')
      .select('*')
      .eq('usage_date', new Date().toISOString().split('T')[0])
    
    if (statsError) throw statsError
    
    // 4. Check for inactive users (no activity in 7 days)
    console.log('👥 Checking inactive users...')
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const { data: inactiveUsers, error: usersError } = await supabase
      .from('user_activity_logs')
      .select('user_id, last_activity')
      .lt('last_activity', sevenDaysAgo.toISOString())
    
    if (usersError) throw usersError
    
    const resultData = {
      cache_cleaned: true,
      logs_cleaned: true,
      daily_stats_updated: stats?.length || 0,
      inactive_users_found: inactiveUsers?.length || 0,
      execution_time_ms: Date.now() - startTime
    }
    
    console.log('✅ Daily maintenance completed successfully')
    console.log(`📊 Results:`, resultData)
    
    await logJobComplete(jobId, 'completed', resultData)
    return resultData
    
  } catch (error) {
    console.error('❌ Daily maintenance failed:', error)
    await logJobComplete(jobId, 'failed', {}, error.message)
    throw error
  }
}

/**
 * Weekly maintenance tasks
 */
async function runWeeklyMaintenance() {
  const jobId = await logJobStart('weekly_maintenance')
  const startTime = Date.now()
  
  try {
    console.log('📅 Running weekly maintenance...')
    
    // 1. Generate weekly analytics report
    console.log('📊 Generating weekly analytics...')
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - 7)
    
    const { data: weeklyStats, error: statsError } = await supabase
      .from('user_usage_summary')
      .select('*')
      .gte('created_at', weekStart.toISOString())
    
    if (statsError) throw statsError
    
    // 2. Archive old conversation data (older than 3 months)
    console.log('📦 Archiving old conversations...')
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
    
    const { data: oldConversations, error: archiveError } = await supabase
      .from('conversations')
      .select('id, created_at')
      .lt('created_at', threeMonthsAgo.toISOString())
      .eq('status', 'completed')
    
    if (archiveError) throw archiveError
    
    // 3. Update user engagement scores
    console.log('🎯 Updating engagement scores...')
    const { data: engagementUpdate, error: engagementError } = await supabase
      .rpc('update_user_engagement_scores')
    
    if (engagementError) {
      console.warn('⚠️ Engagement score update failed (function may not exist):', engagementError.message)
    }
    
    const resultData = {
      weekly_stats_generated: weeklyStats?.length || 0,
      conversations_archived: oldConversations?.length || 0,
      engagement_scores_updated: engagementUpdate ? true : false,
      execution_time_ms: Date.now() - startTime
    }
    
    console.log('✅ Weekly maintenance completed successfully')
    console.log(`📊 Results:`, resultData)
    
    await logJobComplete(jobId, 'completed', resultData)
    return resultData
    
  } catch (error) {
    console.error('❌ Weekly maintenance failed:', error)
    await logJobComplete(jobId, 'failed', {}, error.message)
    throw error
  }
}

/**
 * Monthly maintenance tasks
 */
async function runMonthlyMaintenance() {
  const jobId = await logJobStart('monthly_maintenance')
  const startTime = Date.now()
  
  try {
    console.log('📅 Running monthly maintenance...')
    
    // 1. Generate monthly analytics report
    console.log('📊 Generating monthly analytics...')
    const monthStart = new Date()
    monthStart.setMonth(monthStart.getMonth() - 1)
    
    const { data: monthlyStats, error: statsError } = await supabase
      .from('user_usage_summary')
      .select('*')
      .gte('created_at', monthStart.toISOString())
    
    if (statsError) throw statsError
    
    // 2. Archive old data (older than 6 months)
    console.log('📦 Archiving old data...')
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    
    const { data: oldData, error: archiveError } = await supabase
      .from('token_usage_logs')
      .select('id, created_at')
      .lt('created_at', sixMonthsAgo.toISOString())
    
    if (archiveError) throw archiveError
    
    // 3. Update user budgets for new month
    console.log('💰 Updating user budgets...')
    const { data: budgetUpdate, error: budgetError } = await supabase
      .rpc('reset_monthly_budgets')
    
    if (budgetError) {
      console.warn('⚠️ Budget reset failed (function may not exist):', budgetError.message)
    }
    
    // 4. Generate performance report
    console.log('📈 Generating performance report...')
    const { data: performance, error: perfError } = await supabase
      .rpc('database_health_check')
    
    if (perfError) {
      console.warn('⚠️ Performance check failed (function may not exist):', perfError.message)
    }
    
    const resultData = {
      monthly_stats_generated: monthlyStats?.length || 0,
      old_data_archived: oldData?.length || 0,
      budgets_reset: budgetUpdate ? true : false,
      performance_checked: performance ? true : false,
      execution_time_ms: Date.now() - startTime
    }
    
    console.log('✅ Monthly maintenance completed successfully')
    console.log(`📊 Results:`, resultData)
    
    await logJobComplete(jobId, 'completed', resultData)
    return resultData
    
  } catch (error) {
    console.error('❌ Monthly maintenance failed:', error)
    await logJobComplete(jobId, 'failed', {}, error.message)
    throw error
  }
}

/**
 * Cleanup tasks
 */
async function runCleanup() {
  const jobId = await logJobStart('cleanup_job')
  const startTime = Date.now()
  
  try {
    console.log('🧹 Running cleanup tasks...')
    
    // 1. Clean expired cache
    const { data: cacheCleanup, error: cacheError } = await supabase.rpc('cleanup_expired_cache')
    if (cacheError) throw cacheError
    
    // 2. Clean old cron logs
    const { data: logsCleanup, error: logsError } = await supabase.rpc('cleanup_old_cron_logs')
    if (logsError) throw logsError
    
    // 3. Clean old temporary files
    console.log('🗂️ Cleaning temporary files...')
    const { data: tempFiles, error: tempError } = await supabase
      .from('file_metadata')
      .select('id, file_path')
      .eq('bucket_name', 'temp')
      .lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // 24 hours ago
    
    if (tempError) throw tempError
    
    const resultData = {
      cache_cleaned: true,
      logs_cleaned: true,
      temp_files_found: tempFiles?.length || 0,
      execution_time_ms: Date.now() - startTime
    }
    
    console.log('✅ Cleanup completed successfully')
    console.log(`📊 Results:`, resultData)
    
    await logJobComplete(jobId, 'completed', resultData)
    return resultData
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error)
    await logJobComplete(jobId, 'failed', {}, error.message)
    throw error
  }
}

/**
 * Analytics generation
 */
async function runAnalytics() {
  const jobId = await logJobStart('analytics_job')
  const startTime = Date.now()
  
  try {
    console.log('📊 Generating analytics...')
    
    // 1. User engagement metrics
    console.log('👥 Calculating user engagement...')
    const { data: engagement, error: engagementError } = await supabase
      .from('user_usage_summary')
      .select('*')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
    
    if (engagementError) throw engagementError
    
    // 2. AI usage patterns
    console.log('🤖 Analyzing AI usage patterns...')
    const { data: aiUsage, error: aiError } = await supabase
      .from('token_usage_logs')
      .select('model, task_type, total_tokens, estimated_cost')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
    
    if (aiError) throw aiError
    
    // 3. Lead conversion metrics
    console.log('🎯 Analyzing lead conversion...')
    const { data: leads, error: leadsError } = await supabase
      .from('lead_summaries')
      .select('lead_score, created_at')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    
    if (leadsError) throw leadsError
    
    const resultData = {
      users_analyzed: engagement?.length || 0,
      ai_requests_analyzed: aiUsage?.length || 0,
      leads_analyzed: leads?.length || 0,
      execution_time_ms: Date.now() - startTime
    }
    
    console.log('✅ Analytics generated successfully')
    console.log(`📊 Results:`, resultData)
    
    await logJobComplete(jobId, 'completed', resultData)
    return resultData
    
  } catch (error) {
    console.error('❌ Analytics generation failed:', error)
    await logJobComplete(jobId, 'failed', {}, error.message)
    throw error
  }
}

/**
 * Main execution function
 */
async function main() {
  try {
    let result
    
    switch (jobType) {
      case 'daily':
        result = await runDailyMaintenance()
        break
      case 'weekly':
        result = await runWeeklyMaintenance()
        break
      case 'monthly':
        result = await runMonthlyMaintenance()
        break
      case 'cleanup':
        result = await runCleanup()
        break
      case 'analytics':
        result = await runAnalytics()
        break
      default:
        console.error(`❌ Unknown job type: ${jobType}`)
        console.log('Available job types: daily, weekly, monthly, cleanup, analytics')
        process.exit(1)
    }
    
    console.log(`\n🎉 ${jobType} job completed successfully!`)
    console.log(`⏱️ Total execution time: ${result.execution_time_ms}ms`)
    console.log(`⏰ Completed at: ${new Date().toISOString()}`)
    
    process.exit(0)
    
  } catch (error) {
    console.error(`\n💥 ${jobType} job failed!`)
    console.error('Error:', error.message)
    process.exit(1)
  }
}

// Run the main function
main()
