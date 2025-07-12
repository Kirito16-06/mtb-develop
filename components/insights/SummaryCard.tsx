import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const SummaryCard = ({
  title,
  value,
  icon: Icon,
  tooltip,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  tooltip?: string;
}) => (
  <div className="bg-white rounded-lg p-6 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-sm text-gray-600 cursor-help">{title}</p>
            </TooltipTrigger>
            {tooltip && (
              <TooltipContent>
                <p className="max-w-xs">{tooltip}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
        <h3 className="text-2xl font-bold mt-1">{value}</h3>
      </div>
      <div className="bg-[#F1F3FF] p-3 rounded-full">
        <Icon className="w-6 h-6 text-[#151E46]" />
      </div>
    </div>
  </div>
);

export default SummaryCard;
