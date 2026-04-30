import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { client_id, days = 90 } = await req.json();

    // Fetch calendar events
    const events = await base44.entities.CalendarEvent.filter({
      client_id
    });

    // Filter by date range
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const recentEvents = events.filter(e => new Date(e.started_at) > cutoffDate);

    // Calculate patterns
    const typeDistribution = {};
    const outcomeCounts = { completed: 0, no_show: 0, rescheduled: 0 };
    const durationByType = {};
    let totalDealMoves = 0;

    recentEvents.forEach(e => {
      typeDistribution[e.event_type] = (typeDistribution[e.event_type] || 0) + 1;
      outcomeCounts[e.outcome] = (outcomeCounts[e.outcome] || 0) + 1;
      if (!durationByType[e.event_type]) durationByType[e.event_type] = [];
      durationByType[e.event_type].push(e.duration_minutes);
      if (e.deal_stage_before !== e.deal_stage_after) totalDealMoves++;
    });

    // Calculate no-show rate
    const completedAndNoShow = outcomeCounts.completed + outcomeCounts.no_show;
    const noShowRate = completedAndNoShow > 0 
      ? Math.round((outcomeCounts.no_show / completedAndNoShow) * 100) 
      : 0;

    // Calculate avg meeting duration
    const avgDurationByType = {};
    Object.keys(durationByType).forEach(type => {
      const durations = durationByType[type];
      avgDurationByType[type] = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
    });

    // Deal velocity: average meetings to close
    const dealMovingMeetings = recentEvents.filter(e => e.deal_stage_before && e.deal_stage_after && e.deal_stage_before !== e.deal_stage_after);
    const avgMeetingsPerDealMove = recentEvents.length > 0 
      ? Math.round(recentEvents.length / (dealMovingMeetings.length + 1))
      : 0;

    return Response.json({
      period_days: days,
      total_meetings: recentEvents.length,
      meeting_types: typeDistribution,
      outcomes: outcomeCounts,
      no_show_rate: noShowRate,
      avg_duration_by_type: avgDurationByType,
      deal_progressing_meetings: dealMovingMeetings.length,
      meetings_per_deal_move: avgMeetingsPerDealMove,
      most_productive_type: Object.keys(typeDistribution).reduce((a, b) => 
        typeDistribution[a] > typeDistribution[b] ? a : b, 'other'),
      recommendations: [
        noShowRate > 10 ? '⚠️ High no-show rate - consider pre-call confirmations' : null,
        avgMeetingsPerDealMove > 5 ? '🎯 Consider shorter sales cycles or more qualifying calls' : null,
        !typeDistribution.discovery ? '💡 Few discovery calls - prioritize qualification' : null
      ].filter(Boolean)
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});