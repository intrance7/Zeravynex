import { useState, useRef, useEffect, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Maximize2, ZoomIn, ZoomOut, Search } from 'lucide-react';
import { useDebounce } from './lib/hooks/useDebounce';
import { Button } from './components/ui/Button';
import { Input } from './components/ui/Input';
import { Card } from './components/ui/Card';

interface ThreatGraphViewProps {
  data?: any;
}

// Generate some sample data if none provided to show the impressive graph
const generateSampleGraphData = () => {
  const nodes = [
    { id: 'sample_1', name: 'evil_sample.exe', group: 'Sample', val: 10, color: '#ef4444' },
    { id: 'hash_1', name: 'e3b0c442...', group: 'Hash', val: 5, color: '#f59e0b' },
    { id: 'domain_1', name: 'c2.evil-empire.com', group: 'Domain', val: 7, color: '#f97316' },
    { id: 'ip_1', name: '192.168.1.100', group: 'IP', val: 6, color: '#8b5cf6' },
    { id: 'url_1', name: 'http://c2.evil-empire.com/payload', group: 'URL', val: 6, color: '#a855f7' },
    { id: 'actor_1', name: 'APT29', group: 'Threat Actor', val: 12, color: '#b91c1c' },
    { id: 'tech_1', name: 'T1059: Command and Scripting Interpreter', group: 'Technique', val: 5, color: '#3b82f6' },
    { id: 'tech_2', name: 'T1571: Non-Standard Port', group: 'Technique', val: 5, color: '#3b82f6' },
    { id: 'family_1', name: 'Cobalt Strike', group: 'Malware Family', val: 9, color: '#d946ef' },
    { id: 'cve_1', name: 'CVE-2023-1234', group: 'CVE', val: 8, color: '#ec4899' },
  ];

  const links = [
    { source: 'sample_1', target: 'hash_1', label: 'has_hash' },
    { source: 'sample_1', target: 'url_1', label: 'downloads_from' },
    { source: 'url_1', target: 'domain_1', label: 'hosted_on' },
    { source: 'domain_1', target: 'ip_1', label: 'resolves_to' },
    { source: 'sample_1', target: 'tech_1', label: 'uses' },
    { source: 'sample_1', target: 'tech_2', label: 'uses' },
    { source: 'sample_1', target: 'family_1', label: 'classified_as' },
    { source: 'family_1', target: 'actor_1', label: 'used_by' },
    { source: 'sample_1', target: 'cve_1', label: 'exploits' },
  ];

  return { nodes, links };
};

export default function ThreatGraphView({ data }: ThreatGraphViewProps) {
  const fgRef = useRef<any>(null);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [highlightNodes, setHighlightNodes] = useState(new Set<any>());
  const [highlightLinks, setHighlightLinks] = useState(new Set<any>());
  const [hoverNode, setHoverNode] = useState<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    setGraphData(data && Object.keys(data).length > 0 ? data : generateSampleGraphData());
  }, [data]);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const handleNodeHover = useCallback((node: any) => {
    setHighlightNodes(new Set());
    setHighlightLinks(new Set());
    
    if (node) {
      const newHighlightNodes = new Set([node]);
      const newHighlightLinks = new Set();
      
      graphData.links.forEach((link: any) => {
        if (link.source.id === node.id || link.target.id === node.id) {
          newHighlightLinks.add(link);
          newHighlightNodes.add(link.source.id === node.id ? link.target : link.source);
        }
      });
      
      setHighlightNodes(newHighlightNodes);
      setHighlightLinks(newHighlightLinks);
    }
    
    setHoverNode(node || null);
  }, [graphData]);

  const paintNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const isHighlighted = highlightNodes.has(node);
    const isHovered = node === hoverNode;
    
    // Dim if searching and no match
    const isSearchMatch = debouncedSearchQuery && node.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
    const isDimmed = debouncedSearchQuery && !isSearchMatch && !isHighlighted;
    
    const size = node.val || 5;
    
    ctx.beginPath();
    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
    
    if (isDimmed) {
        ctx.fillStyle = `${node.color}33`; // 20% opacity
    } else {
        ctx.fillStyle = node.color || '#3b82f6';
    }
    
    ctx.fill();

    if (isHighlighted || isHovered) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = isHovered ? 2 : 1;
      ctx.stroke();
    }

    // Draw text
    if (!isDimmed && (isHighlighted || globalScale > 1.5)) {
      const label = node.name;
      const fontSize = 12 / globalScale;
      ctx.font = `${fontSize}px Sans-Serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillText(label, node.x, node.y + size + fontSize);
    }
  }, [highlightNodes, hoverNode, debouncedSearchQuery]);

  const handleZoomIn = () => fgRef.current?.zoom(fgRef.current.zoom() * 1.2, 400);
  const handleZoomOut = () => fgRef.current?.zoom(fgRef.current.zoom() / 1.2, 400);
  const handleFit = () => fgRef.current?.zoomToFit(400);

  return (
    <div className="relative w-full h-[700px] bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
      <Card className="absolute top-4 left-4 z-10 w-64 bg-background/80 backdrop-blur-md p-4 shadow-lg border-border/50">
        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            Threat Intelligence
        </h3>
        <div className="relative mb-4">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input 
                type="text"
                placeholder="Find node..."
                aria-label="Search threat graph nodes"
                className="pl-8 bg-background/50 h-9 text-xs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
        
        {hoverNode && (
            <div className="mt-4 pt-3 border-t border-border/50">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Selected Node</span>
                <div className="text-sm font-bold text-foreground truncate" title={hoverNode.name}>{hoverNode.name}</div>
                <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: hoverNode.color }}></div>
                    <span className="text-xs text-muted-foreground">{hoverNode.group}</span>
                </div>
            </div>
        )}
      </Card>

      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <Button variant="outline" size="icon" onClick={handleZoomIn} className="bg-background/80 backdrop-blur-md border-border/50 hover:bg-muted/80 shadow-sm" title="Zoom In" aria-label="Zoom In">
          <ZoomIn className="w-4 h-4" aria-hidden="true" />
        </Button>
        <Button variant="outline" size="icon" onClick={handleZoomOut} className="bg-background/80 backdrop-blur-md border-border/50 hover:bg-muted/80 shadow-sm" title="Zoom Out" aria-label="Zoom Out">
          <ZoomOut className="w-4 h-4" aria-hidden="true" />
        </Button>
        <Button variant="outline" size="icon" onClick={handleFit} className="bg-background/80 backdrop-blur-md border-border/50 hover:bg-muted/80 shadow-sm" title="Fit to Screen" aria-label="Fit to Screen">
          <Maximize2 className="w-4 h-4" aria-hidden="true" />
        </Button>
      </div>

      <div className="flex-1 bg-[#0d1117]" ref={containerRef}>
        {dimensions.width > 0 && (
          <ForceGraph2D
            ref={fgRef}
            width={dimensions.width}
            height={dimensions.height}
            graphData={graphData}
            nodeLabel="name"
            nodeColor={(node: any) => node.color}
            nodeRelSize={6}
            linkColor={(link: any) => highlightLinks.has(link) ? '#a3a3a3' : '#30363d'}
            linkWidth={(link: any) => highlightLinks.has(link) ? 2 : 1}
            linkDirectionalParticles={(link: any) => highlightLinks.has(link) ? 4 : 0}
            linkDirectionalParticleWidth={2}
            onNodeHover={handleNodeHover}
            nodeCanvasObject={paintNode}
            cooldownTicks={100}
            d3AlphaDecay={0.02}
            d3VelocityDecay={0.3}
          />
        )}
      </div>
    </div>
  );
}
