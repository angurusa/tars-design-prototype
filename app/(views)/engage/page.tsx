"use client";

import { useState, useMemo } from "react";
import { usePrototype } from "@/lib/prototype-context";
import { mockEngagePosts } from "@/lib/mock-data";
import type { EngagePost } from "@/lib/types";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
import { StatusBanner } from "@/components/shared/status-banner";
import { SkeletonCardList } from "@/components/shared/skeleton-card-list";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

import {
  Trash2,
  FileText,
  Link2,
  ChevronDown,
  Newspaper,
  Check,
  PenTool,
  Loader2,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Mock newsletter data
// ---------------------------------------------------------------------------

type NewsletterItem = {
  title: string;
  link: string;
  source: string;
};

const mockNewsletters: NewsletterItem[] = [
  {
    title: "The Hidden Cost of Microservices: When Monoliths Win",
    link: "https://newsletter.pragmaticengineer.com/p/hidden-cost-microservices",
    source: "Pragmatic Engineer",
  },
  {
    title: "How Stripe Scaled Their ML Platform to 10x Throughput",
    link: "https://newsletter.systemdesign.one/p/stripe-ml-platform",
    source: "ByteByteGo",
  },
  {
    title: "The Manager's Guide to AI-Assisted Development Teams",
    link: "https://www.lennysnewsletter.com/p/ai-assisted-dev",
    source: "Lenny's Newsletter",
  },
  {
    title: "Edge Computing in 2026: Beyond CDNs",
    link: "https://blog.cloudflare.com/edge-2026",
    source: "Cloudflare Blog",
  },
  {
    title: "Why Senior Engineers Should Write More (and How to Start)",
    link: "https://leaddev.com/writing-for-engineers",
    source: "LeadDev",
  },
];

type EngageTab = "drafts" | "approved" | "discarded";

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function EngagePostsPage() {
  const { getPageState } = usePrototype();
  const pageState = getPageState("/engage");

  const [activeTab, setActiveTab] = useState<EngageTab>("drafts");
  const [showSourceInput, setShowSourceInput] = useState(false);
  const [articleContent, setArticleContent] = useState("");
  const [showNewsletters, setShowNewsletters] = useState(false);
  const [excludeWorkDetails, setExcludeWorkDetails] = useState(false);
  const [newsletterCategory, setNewsletterCategory] = useState<string | null>(null);

  // Use mock data directly -- no mutations needed for prototype
  const posts = mockEngagePosts;

  const drafts = useMemo(
    () => posts.filter((p) => p.status === "draft" || p.status === "improved"),
    [posts]
  );
  const approved = useMemo(
    () => posts.filter((p) => p.status === "approved" || p.status === "published"),
    [posts]
  );
  const discarded = useMemo(
    () => posts.filter((p) => p.status === "discarded"),
    [posts]
  );

  // ---------------------------------------------------------------------------
  // State rendering
  // ---------------------------------------------------------------------------

  if (pageState === "loading") {
    return <SkeletonCardList cards={3} />;
  }

  if (pageState === "empty") {
    return (
      <div className="space-y-6">
        <PageHeader title="Engage Posts" />
        <EmptyState
          icon={PenTool}
          title="No engage posts yet"
          description='Click "From My Work" to generate your first post draft.'
          action={{ label: "From My Work", onClick: () => {} }}
        />
      </div>
    );
  }

  if (pageState === "error") {
    return (
      <div className="space-y-6">
        <PageHeader title="Engage Posts" />
        <StatusBanner variant="error">
          <div>
            <p className="text-sm font-medium text-destructive">Failed to load engage posts</p>
            <p className="text-sm text-muted-foreground">
              Could not connect to the knowledge engine. Check that PostgreSQL is running.
            </p>
          </div>
        </StatusBanner>
      </div>
    );
  }

  // populated / streaming
  return (
    <div className="space-y-6">
      <PageHeader
        title="Engage Posts"
        actions={
          <div className="flex items-center gap-2">
            <Button>
              <FileText className="mr-1 h-4 w-4" />
              From My Work
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowSourceInput(!showSourceInput);
                setShowNewsletters(false);
              }}
            >
              <Link2 className="mr-1 h-4 w-4" />
              From Article
              <ChevronDown className="ml-1 h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowNewsletters(!showNewsletters);
                setShowSourceInput(false);
              }}
            >
              <Newspaper className="mr-1 h-4 w-4" />
              From Newsletters
            </Button>
          </div>
        }
      />

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="exclude-work"
          checked={excludeWorkDetails}
          onChange={(e) => setExcludeWorkDetails(e.target.checked)}
          className="h-3.5 w-3.5 rounded border-border"
        />
        <label htmlFor="exclude-work" className="text-sm text-muted-foreground cursor-pointer">
          Don&apos;t include personal work details in the post
        </label>
      </div>

      {/* Article input panel */}
      {showSourceInput && (
        <Card>
          <CardContent className="pt-6 space-y-3">
            <p className="text-sm font-medium">
              Paste newsletter or article content below. The agent will form an opinion on it
              grounded in your own work experience.
            </p>
            <Textarea
              placeholder="Paste article text, newsletter excerpt, or a URL..."
              value={articleContent}
              onChange={(e) => setArticleContent(e.target.value)}
              rows={6}
            />
            <div className="flex items-center gap-2">
              <Button size="sm" disabled={!articleContent.trim()}>
                Draft Post
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowSourceInput(false);
                  setArticleContent("");
                }}
              >
                Cancel
              </Button>
              <span className="text-sm text-muted-foreground ml-auto">
                Sources: Pragmatic Engineer, Lenny&apos;s Newsletter, ByteByteGo, HN, etc.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Newsletter picker */}
      {showNewsletters && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Pick an article to respond to</p>
              <Button variant="ghost" size="sm" onClick={() => setShowNewsletters(false)}>
                Close
              </Button>
            </div>

            {/* Category tabs */}
            <div className="flex gap-1.5">
              {[
                { label: "All", value: null },
                { label: "Frontend", value: "Frontend" },
                { label: "AI", value: "AI" },
                { label: "Engineering", value: "Engineering" },
              ].map(({ label, value }) => (
                <Button
                  key={label}
                  variant={newsletterCategory === value ? "default" : "outline"}
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => setNewsletterCategory(value)}
                >
                  {label}
                </Button>
              ))}
            </div>

            <div className="space-y-0.5 max-h-96 overflow-y-auto">
              {mockNewsletters.map((item, i) => (
                <button
                  key={i}
                  className="w-full text-left px-3 py-2.5 rounded-md hover:bg-accent/50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-snug group-hover:text-foreground">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs px-1.5 py-0">
                          {item.source}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Source summary */}
            <div className="flex flex-wrap gap-1.5 pt-2 border-t">
              <span className="text-sm text-muted-foreground">Pragmatic Engineer (2)</span>
              <span className="text-sm text-muted-foreground">ByteByteGo (1)</span>
              <span className="text-sm text-muted-foreground">Lenny&apos;s Newsletter (1)</span>
              <span className="text-sm text-muted-foreground">LeadDev (1)</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as EngageTab)}>
        <TabsList>
          <TabsTrigger value="drafts">Drafts ({drafts.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approved.length})</TabsTrigger>
          <TabsTrigger value="discarded">Discarded ({discarded.length})</TabsTrigger>
        </TabsList>

        {/* Drafts */}
        <TabsContent value="drafts" className="space-y-4 mt-4">
          {drafts.length === 0 && (
            <EmptyState
              icon={PenTool}
              title="No drafts yet"
              description='Click "From My Work" or "From Article" to generate a post.'
            />
          )}
          {drafts.map((post) => (
            <Card key={post.id}>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{post.sourceType}</Badge>
                  <span className="text-sm text-muted-foreground">{post.date}</span>
                  {post.valuesAlignment >= 80 && (
                    <Badge variant="outline" className="text-xs">
                      {post.valuesAlignment}% aligned
                    </Badge>
                  )}
                </div>
                <MarkdownRenderer content={post.content} />
                {post.topics.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {post.topics.map((topic) => (
                      <Badge key={topic} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="gap-2">
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Approve
                </Button>
                <Button variant="ghost" size="sm">
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Discard
                </Button>
              </CardFooter>
            </Card>
          ))}
        </TabsContent>

        {/* Approved */}
        <TabsContent value="approved" className="space-y-4 mt-4">
          {approved.length === 0 && <EmptyState icon={Check} title="No approved posts yet" />}
          {approved.map((post) => (
            <Card key={post.id}>
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">{post.status}</Badge>
                  {post.reactions !== undefined && (
                    <span className="text-xs text-muted-foreground">
                      {post.reactions} reactions
                    </span>
                  )}
                  {post.rating !== undefined && (
                    <span className="text-xs text-muted-foreground">
                      Rating: {post.rating}/5
                    </span>
                  )}
                </div>
                <MarkdownRenderer content={post.content} />
                {post.topics.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {post.topics.map((topic) => (
                      <Badge key={topic} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Discarded */}
        <TabsContent value="discarded" className="space-y-4 mt-4">
          {discarded.length === 0 && <EmptyState icon={Trash2} title="No discarded posts" />}
          {discarded.map((post) => (
            <Card key={post.id} className="opacity-60">
              <CardContent className="pt-6">
                <p className="text-sm">{post.content.slice(0, 150)}...</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
