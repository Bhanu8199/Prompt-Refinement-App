import { Layout } from "@/components/Layout";
import { usePrompts } from "@/hooks/use-prompts";
import { Link } from "wouter";
import { Loader2, Calendar, ChevronRight, FileText, Search } from "lucide-react";
import { format } from "date-fns";
import { type RefinedOutput } from "@shared/schema";

export default function History() {
  const { data: prompts, isLoading, error } = usePrompts();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-red-400 p-8 text-center bg-red-900/10 rounded-2xl border border-red-500/20">
          <h3 className="text-lg font-bold">Failed to load history</h3>
          <p className="text-sm mt-2">{error.message}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">History</h1>
            <p className="text-muted-foreground">Manage and revisit your refined prompts.</p>
          </div>
          
          <div className="relative w-full md:w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
             <input 
               type="text" 
               placeholder="Search prompts..." 
               className="w-full bg-secondary border border-border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
             />
          </div>
        </div>

        {!prompts?.length ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-border">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
               <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">No prompts yet</h3>
            <p className="text-muted-foreground mb-6">Start by refining your first requirement.</p>
            <Link href="/" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium">
              Create New
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {prompts.map((prompt) => {
              const refinedData = prompt.refinedPrompt as unknown as RefinedOutput;
              const preview = prompt.originalInput.slice(0, 100) + (prompt.originalInput.length > 100 ? "..." : "");
              
              return (
                <Link key={prompt.id} href={`/prompts/${prompt.id}`}>
                  <div className="group bg-card hover:bg-secondary/40 border border-border hover:border-primary/50 rounded-xl p-5 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 uppercase tracking-wide">
                            {prompt.inputType}
                          </span>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3 mr-1" />
                            {prompt.createdAt && format(new Date(prompt.createdAt), "MMM d, yyyy • h:mm a")}
                          </div>
                        </div>
                        
                        <h3 className="font-semibold text-white text-lg group-hover:text-primary transition-colors">
                          {refinedData.primaryIntent || "Untitled Prompt"}
                        </h3>
                        
                        <p className="text-muted-foreground text-sm line-clamp-2 font-light">
                          {preview}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-3 self-center">
                         <div className="flex flex-col items-center">
                            <span className="text-xs text-muted-foreground font-mono mb-1">SCORE</span>
                            <div className={`
                              text-lg font-bold
                              ${(prompt.confidenceScore || 0) > 0.8 ? 'text-green-400' : 'text-yellow-400'}
                            `}>
                              {((prompt.confidenceScore || 0) * 100).toFixed(0)}%
                            </div>
                         </div>
                         <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-white transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
