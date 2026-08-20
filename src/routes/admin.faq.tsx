import { createFileRoute } from "@tanstack/react-router";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  Edit2,
  Eye,
  EyeOff,
  Folder,
  HelpCircle,
  Layers,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { AppShell, StatCard } from "@/components/tossa/AppShell";
import { Badge, Button, Field, Input, Panel, Textarea } from "@/components/tossa/kit";
import { EmptySectionFallback } from "@/components/tossa/EmptySectionFallback";
import { pageHead } from "@/lib/head";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/faq")({
  head: () =>
    pageHead(
      "FAQ Manager · tossatale admin",
      "Configure, organize, and publish frequently asked questions and answers for the public /faq screen.",
    ),
  component: AdminFAQScreen,
});

const DEFAULT_CATEGORIES = [
  "General",
  "Submissions",
  "Press & Partnerships",
  "Gift Cards",
  "Platform",
  "Account & Membership",
];

const DEFAULT_FAQS = [
  {
    id: 1,
    category: "Press & Partnerships",
    question: "How do Press & Partnerships work at tossatale?",
    answer:
      "We welcome media inquiries, interviews, brand collaborations, and literary event partnerships. For press kits, interview requests with our founders or writers, or film licensing inquiries, please reach out via our contact page or email press@tossatale.com.",
    order: 1,
    is_active: true,
  },
  {
    id: 2,
    category: "Press & Partnerships",
    question: "Can we feature or syndicate tossatale stories?",
    answer:
      "Yes! Selected stories and short films are available for syndication and film festival distribution. Contact our team to discuss licensing and rights management.",
    order: 2,
    is_active: true,
  },
  {
    id: 3,
    category: "Gift Cards",
    question: "How do Gift Cards work?",
    answer:
      "tossatale Gift Cards allow you to gift annual or lifetime reading passes to friends and family. Once purchased, a unique digital voucher code is emailed to the recipient, which can be redeemed instantly.",
    order: 3,
    is_active: true,
  },
  {
    id: 4,
    category: "Gift Cards",
    question: "How do I redeem a Gift Card code?",
    answer:
      "Log into your tossatale account, navigate to Account Settings > Redeem Voucher, and enter your 16-digit gift card code to unlock your reading membership immediately.",
    order: 4,
    is_active: true,
  },
  {
    id: 5,
    category: "Submissions",
    question: "How do I submit a story or manuscript pitch?",
    answer:
      "We read every submission with care. You can submit your pitch through our Contact form under 'Pitching a story' or directly via the Writer Studio. Keep it brief—give us a compelling reason to turn the page!",
    order: 5,
    is_active: true,
  },
  {
    id: 6,
    category: "Submissions",
    question: "What genres and story formats do you accept?",
    answer:
      "We publish short fiction, serials, personal essays, creative non-fiction, and short film scripts. We look for authentic voices, depth, and stories that move readers.",
    order: 6,
    is_active: true,
  },
  {
    id: 7,
    category: "Platform",
    question: "What makes tossatale different from other platforms?",
    answer:
      "tossatale is built for people who finish what they start. No clickbait, no infinite doom-scroll, no outrage algorithms. Just curated stories, original short films, and quiet reading spaces.",
    order: 7,
    is_active: true,
  },
  {
    id: 8,
    category: "Platform",
    question: "Is tossatale free to read?",
    answer:
      "We offer a generous selection of free original stories, blogs, and short films for everyone. Readers can also support writers through membership passes to unlock full archive access.",
    order: 8,
    is_active: true,
  },
];

function AdminFAQScreen() {
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<any | null>(null);

  // Form State
  const [formCategory, setFormCategory] = useState("General");
  const [formCustomCategory, setFormCustomCategory] = useState("");
  const [formQuestion, setFormQuestion] = useState("");
  const [formAnswer, setFormAnswer] = useState("");
  const [formOrder, setFormOrder] = useState("0");
  const [formIsActive, setFormIsActive] = useState(true);

  // 1. Fetch FAQs from Backend
  const { data: apiFaqs, isLoading } = useQuery({
    queryKey: ["admin-faqs-list"],
    queryFn: async () => {
      try {
        const res = await api.get("/admin/faqs/");
        return res.data?.data || res.data?.results || res.data || [];
      } catch {
        return DEFAULT_FAQS;
      }
    },
  });

  const faqsList: any[] = (apiFaqs && Array.isArray(apiFaqs) && apiFaqs.length > 0)
    ? apiFaqs
    : DEFAULT_FAQS;

  // Derive all unique categories
  const allCategories = Array.from(
    new Set(["All", ...DEFAULT_CATEGORIES, ...faqsList.map((f) => f.category).filter(Boolean)])
  );

  // 2. Create / Update Mutation
  const saveFaqMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (editingFaq?.id) {
        return await api.patch(`/admin/faqs/${editingFaq.id}/`, payload);
      }
      return await api.post("/admin/faqs/", payload);
    },
    onSuccess: () => {
      toast.success(editingFaq ? "FAQ item updated!" : "FAQ question published!", {
        description: "Changes are immediately visible on the public /faq screen.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-faqs-list"] });
      queryClient.invalidateQueries({ queryKey: ["public-faqs-list"] });
      handleCloseModal();
    },
    onError: (err: any) => {
      toast.error("Failed to save FAQ item", {
        description: err.response?.data?.message || err.message || "An unexpected error occurred.",
      });
    },
  });

  // 3. Delete Mutation
  const deleteFaqMutation = useMutation({
    mutationFn: async (id: number | string) => {
      return await api.delete(`/admin/faqs/${id}/`);
    },
    onSuccess: () => {
      toast.success("FAQ item deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-faqs-list"] });
      queryClient.invalidateQueries({ queryKey: ["public-faqs-list"] });
    },
    onError: (err: any) => {
      toast.error("Failed to delete FAQ", {
        description: err.response?.data?.message || err.message || "Could not delete item.",
      });
    },
  });

  // 4. Quick Toggle Active Mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, currentActive }: { id: number | string; currentActive: boolean }) => {
      return await api.patch(`/admin/faqs/${id}/`, { is_active: !currentActive });
    },
    onSuccess: (_, variables) => {
      toast.success(variables.currentActive ? "FAQ item hidden" : "FAQ item published live");
      queryClient.invalidateQueries({ queryKey: ["admin-faqs-list"] });
      queryClient.invalidateQueries({ queryKey: ["public-faqs-list"] });
    },
    onError: (err: any) => {
      toast.error("Status update failed", { description: err.message });
    },
  });

  const handleOpenAddModal = () => {
    setEditingFaq(null);
    setFormCategory("General");
    setFormCustomCategory("");
    setFormQuestion("");
    setFormAnswer("");
    setFormOrder(String(faqsList.length + 1));
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (faq: any) => {
    setEditingFaq(faq);
    setFormCategory(faq.category || "General");
    setFormCustomCategory("");
    setFormQuestion(faq.question || "");
    setFormAnswer(faq.answer || "");
    setFormOrder(String(faq.order ?? 0));
    setFormIsActive(faq.is_active ?? true);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingFaq(null);
    setFormQuestion("");
    setFormAnswer("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuestion.trim() || formQuestion.trim().length < 5) {
      toast.error("Please enter a question (at least 5 characters).");
      return;
    }
    if (!formAnswer.trim() || formAnswer.trim().length < 10) {
      toast.error("Please provide an answer (at least 10 characters).");
      return;
    }

    const finalCategory = (formCategory === "Custom" ? formCustomCategory.trim() : formCategory) || "General";

    saveFaqMutation.mutate({
      category: finalCategory,
      question: formQuestion.trim(),
      answer: formAnswer.trim(),
      order: Number(formOrder) || 0,
      is_active: formIsActive,
    });
  };

  const handleDelete = (faq: any) => {
    if (window.confirm(`Are you sure you want to delete the FAQ question: "${faq.question}"?`)) {
      deleteFaqMutation.mutate(faq.id);
    }
  };

  // Filter list
  const filteredFaqs = faqsList.filter((f) => {
    const matchesCategory =
      selectedCategory === "All" || f.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      f.question?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.answer?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const liveCount = faqsList.filter((f) => f.is_active).length;
  const hiddenCount = faqsList.length - liveCount;

  return (
    <AppShell
      role="admin"
      title="FAQ Manager"
      blurb="Create, edit, and organize frequently asked questions displayed on the public /faq screen."
      actions={
        <Button onClick={handleOpenAddModal} variant="primary" className="gap-1.5">
          <Plus className="size-4" /> Add FAQ Question
        </Button>
      }
    >
      {/* Top Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Questions" value={String(faqsList.length)} hint="all entries" />
        <StatCard label="Live on FAQ Screen" value={String(liveCount)} hint="publicly visible" />
        <StatCard label="Hidden / Draft" value={String(hiddenCount)} hint="unpublished" />
        <StatCard label="Categories" value={String(allCategories.length - 1)} hint="topic groups" />
      </div>

      {/* Main FAQ Configuration Desk */}
      <Panel className="p-6 lg:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border pb-5">
          {/* Search bar */}
          <div className="relative w-full max-w-md">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions or answers..."
              className="pl-10"
            />
            <Search className="size-4 text-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          <span className="text-xs text-subtle font-sans">
            Showing {filteredFaqs.length} of {faqsList.length} FAQs
          </span>
        </div>

        {/* Category Pills */}
        <div className="mt-4 flex flex-wrap gap-2 pb-2">
          {allCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors cursor-pointer",
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-surface-alt/70 text-subtle hover:bg-surface-hover hover:text-heading border border-border/60"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Questions List */}
        {isLoading ? (
          <div className="py-16 text-center text-subtle font-medium flex items-center justify-center gap-3">
            <Loader2 className="size-5 animate-spin text-primary" /> Loading FAQ configurations...
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div className="mt-6">
            <EmptySectionFallback
              icon="book"
              title="No FAQ Questions Found"
              description={
                searchQuery
                  ? "No questions match your current search criteria."
                  : "Click 'Add FAQ Question' to create the first entry for this category."
              }
            />
          </div>
        ) : (
          <div className="mt-6 divide-y divide-border">
            {filteredFaqs.map((faq) => (
              <div
                key={faq.id}
                className="group flex flex-col sm:flex-row sm:items-start justify-between gap-4 py-5 transition-colors hover:bg-surface-alt/25 px-4 rounded-2xl"
              >
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <Badge tone={faq.is_active ? "success" : "warning"} className="text-[0.6875rem]">
                      {faq.is_active ? "Live" : "Hidden"}
                    </Badge>
                    <span className="font-sans text-xs font-bold text-primary">
                      {faq.category || "General"}
                    </span>
                    <span className="text-[0.75rem] text-subtle">· Order: #{faq.order ?? 0}</span>
                  </div>

                  <h3 className="text-base font-display font-bold text-heading group-hover:text-primary transition-colors">
                    {faq.question}
                  </h3>
                  <p className="text-sm text-subtle leading-relaxed whitespace-pre-line line-clamp-3">
                    {faq.answer}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-1">
                  <Button
                    variant="ghostOutline"
                    size="sm"
                    onClick={() =>
                      toggleActiveMutation.mutate({ id: faq.id, currentActive: Boolean(faq.is_active) })
                    }
                    className="h-8 px-2.5 text-xs gap-1"
                    title={faq.is_active ? "Hide from public FAQ" : "Publish live to public FAQ"}
                  >
                    {faq.is_active ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                    {faq.is_active ? "Hide" : "Publish"}
                  </Button>

                  <Button
                    variant="ghostOutline"
                    size="sm"
                    onClick={() => handleOpenEditModal(faq)}
                    className="h-8 px-2.5 text-xs gap-1"
                  >
                    <Edit2 className="size-3.5" /> Edit
                  </Button>

                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(faq)}
                    className="h-8 px-2.5 text-xs gap-1"
                    title="Delete Question"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* Add / Edit FAQ Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={handleCloseModal}
        >
          <div
            className="relative flex flex-col w-full max-w-xl max-h-[90vh] rounded-3xl border border-border bg-surface p-6 sm:p-7 shadow-2xl overflow-y-auto animate-in zoom-in-95 duration-200 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <HelpCircle className="size-5 text-primary" />
                <h3 className="font-display text-xl font-bold text-heading">
                  {editingFaq ? "Edit FAQ Question" : "Add FAQ Question"}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="grid size-8 place-items-center rounded-full text-subtle hover:bg-surface-hover"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Category Group">
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-heading focus:border-primary focus:outline-hidden"
                  >
                    {DEFAULT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="Custom">+ Create New Category</option>
                  </select>
                </Field>

                <Field label="Display Priority Order" hint="Lower appears first">
                  <Input
                    type="number"
                    value={formOrder}
                    onChange={(e) => setFormOrder(e.target.value)}
                    placeholder="1"
                    min="0"
                  />
                </Field>
              </div>

              {formCategory === "Custom" && (
                <Field label="Custom Category Name">
                  <Input
                    value={formCustomCategory}
                    onChange={(e) => setFormCustomCategory(e.target.value)}
                    placeholder="e.g., Copyright & Licensing"
                    required
                  />
                </Field>
              )}

              <Field label="Question" hint="Clear, concise prompt">
                <Input
                  value={formQuestion}
                  onChange={(e) => setFormQuestion(e.target.value)}
                  placeholder="e.g., How do I submit a manuscript pitch?"
                  required
                />
              </Field>

              <Field label="Answer" hint="Detailed answer displayed when expanded">
                <Textarea
                  rows={5}
                  value={formAnswer}
                  onChange={(e) => setFormAnswer(e.target.value)}
                  placeholder="Provide the comprehensive answer, contact links, or instructional steps..."
                  required
                />
              </Field>

              <div className="flex items-center gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="faq-active-toggle"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="size-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                />
                <label
                  htmlFor="faq-active-toggle"
                  className="font-sans text-xs font-bold text-heading cursor-pointer"
                >
                  Publish live to public /faq screen immediately
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="ghostOutline" size="sm" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={saveFaqMutation.isPending}
                  className="gap-1.5"
                >
                  {saveFaqMutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Check className="size-4" />
                  )}
                  {saveFaqMutation.isPending
                    ? "Saving..."
                    : editingFaq
                    ? "Save Changes"
                    : "Create Question"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
