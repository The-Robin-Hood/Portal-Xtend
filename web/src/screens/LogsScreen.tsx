import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
const LogsScreen = ({
  logs,
  setLogs,
}: {
  logs: string[];
  setLogs: Function;
}) => {
  return (
    <div className="mt-3 flex flex-col justify-center">
      <div className="w-[300px] sm:w-[500px] md:w-[600px] flex flex-col bg-gray-800 rounded-lg p-5 max-h-96 overflow-auto relative">
        {logs.map((log, index) => (
            <pre key={index}>{JSON.stringify(log, null, 2).replace(/"/g, "")}</pre>
        ))}
        {logs.length === 0 && <p className="text-gray-300">No logs</p>}
      </div>
      {logs.length > 0 && (
        <Button
          variant="link"
          onClick={() => setLogs([])}
          className="flex gap-1"
        >
          <span>Clear logs</span>
          <Trash2 className="w-4" />
        </Button>
      )}
    </div>
  );
};

export default LogsScreen;
