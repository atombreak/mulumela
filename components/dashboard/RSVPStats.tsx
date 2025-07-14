import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface RSVPStatsProps {
  guests: {
    status: string;
    rsvpResponse?: string | null;
  }[];
}

export function RSVPStats({ guests }: RSVPStatsProps) {
  // Calculate RSVP statistics
  const totalGuests = guests.length;
  const responded = guests.filter(g => g.status === 'responded').length;
  const notResponded = totalGuests - responded;
  
  const yesResponses = guests.filter(g => g.rsvpResponse === 'yes').length;
  const noResponses = guests.filter(g => g.rsvpResponse === 'no').length;
  const maybeResponses = guests.filter(g => g.rsvpResponse === 'maybe').length;

  // Calculate percentages
  const responseRate = totalGuests > 0 ? (responded / totalGuests) * 100 : 0;
  const yesRate = responded > 0 ? (yesResponses / responded) * 100 : 0;
  const noRate = responded > 0 ? (noResponses / responded) * 100 : 0;
  const maybeRate = responded > 0 ? (maybeResponses / responded) * 100 : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Math.round(responseRate)}%</div>
          <Progress value={responseRate} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {responded} of {totalGuests} guests responded
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Attending</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{yesResponses}</div>
          <Progress value={yesRate} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {Math.round(yesRate)}% of responses
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Not Attending</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{noResponses}</div>
          <Progress value={noRate} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {Math.round(noRate)}% of responses
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Maybe</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{maybeResponses}</div>
          <Progress value={maybeRate} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {Math.round(maybeRate)}% of responses
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 