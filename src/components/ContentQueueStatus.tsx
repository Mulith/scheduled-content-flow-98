
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Play, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useContentQueue } from "@/hooks/useContentQueue";
import { formatDistanceToNow } from "date-fns";

export const ContentQueueStatus = () => {
  const {
    generationQueue,
    monitoringQueue,
    isLoadingQueue,
    isLoadingMonitoring,
    triggerMonitoring,
    triggerGeneration,
  } = useContentQueue();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'processing':
        return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case 'processing':
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case 'completed':
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case 'failed':
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const pendingCount = generationQueue?.filter(item => item.status === 'pending').length || 0;
  const processingCount = generationQueue?.filter(item => item.status === 'processing').length || 0;

  return (
    <div className="space-y-4">
      {/* Queue Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-black/40 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending Generation</p>
                <p className="text-2xl font-bold text-white">{pendingCount}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Currently Processing</p>
                <p className="text-2xl font-bold text-white">{processingCount}</p>
              </div>
              <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Monitors</p>
                <p className="text-2xl font-bold text-white">
                  {monitoringQueue?.filter(item => item.status === 'active').length || 0}
                </p>
              </div>
              <Play className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Manual Controls */}
      <Card className="bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Queue Controls</CardTitle>
          <CardDescription className="text-gray-400">
            Manually trigger content monitoring and generation processes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={() => triggerMonitoring.mutate()}
              disabled={triggerMonitoring.isPending}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              {triggerMonitoring.isPending ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Trigger Monitoring
            </Button>
            <Button
              onClick={() => triggerGeneration.mutate()}
              disabled={triggerGeneration.isPending}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              {triggerGeneration.isPending ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Trigger Generation
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generation Queue */}
      <Card className="bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Generation Queue</CardTitle>
          <CardDescription className="text-gray-400">
            Content generation requests and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingQueue ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
            </div>
          ) : generationQueue?.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No generation requests</p>
          ) : (
            <div className="space-y-3">
              {generationQueue?.slice(0, 10).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(item.status)}
                    <div>
                      <p className="text-white font-medium">
                        {item.content_channels?.name || 'Unknown Channel'}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {item.items_to_generate} item(s) • {item.content_channels?.schedule}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                    <p className="text-gray-400 text-sm">
                      {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monitoring Queue */}
      <Card className="bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Monitoring Queue</CardTitle>
          <CardDescription className="text-gray-400">
            Channels being monitored for content requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingMonitoring ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
            </div>
          ) : monitoringQueue?.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No channels being monitored</p>
          ) : (
            <div className="space-y-3">
              {monitoringQueue?.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      item.content_channels?.is_active ? 'bg-green-400' : 'bg-gray-400'
                    }`} />
                    <div>
                      <p className="text-white font-medium">
                        {item.content_channels?.name || 'Unknown Channel'}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {item.content_channels?.schedule} • 
                        Next check: {formatDistanceToNow(new Date(item.next_check_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(item.status)}>
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
