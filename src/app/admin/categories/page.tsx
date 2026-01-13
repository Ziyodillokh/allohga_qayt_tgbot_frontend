"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks";
import { useAdminContext } from "@/contexts/AdminContext";
import { getCategoryIconUrl, getUploadUrl } from "@/lib/utils";
import toast from "react-hot-toast";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  questionsCount: number;
  testsCount?: number;
  createdAt: string;
  group?: string;
  difficultyLevels?: string[];
}

interface QuestionLevel {
  id: string;
  name: string;
  file: File | null;
  questions: any[];
  parsed: boolean;
  count: number;
}

// Predefined groups
const CATEGORY_GROUPS = [
  { id: "programming", name: "Dasturlash" },
  { id: "frontend", name: "Frontend" },
  { id: "backend", name: "Backend" },
  { id: "database", name: "Database" },
  { id: "devops", name: "DevOps" },
  { id: "science", name: "Fanlar" },
  { id: "custom", name: "+ Yangi guruh" },
];

export default function AdminCategories() {
  const { token } = useAuth();
  const { isReadOnly } = useAdminContext();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [newCategory, setNewCategory] = useState({
    name: "",
    icon: "",
    group: "programming",
  });
  const [customGroupName, setCustomGroupName] = useState("");
  const [importData, setImportData] = useState("");
  const [importing, setImporting] = useState(false);
  const [iconType, setIconType] = useState<"emoji" | "image">("emoji");
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);

  // Question levels (tipler)
  const [questionLevels, setQuestionLevels] = useState<QuestionLevel[]>([
    {
      id: "1",
      name: "Oson",
      file: null,
      questions: [],
      parsed: false,
      count: 0,
    },
    {
      id: "2",
      name: "O'rta",
      file: null,
      questions: [],
      parsed: false,
      count: 0,
    },
    {
      id: "3",
      name: "Qiyin",
      file: null,
      questions: [],
      parsed: false,
      count: 0,
    },
  ]);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [createStep, setCreateStep] = useState<"info" | "questions">("info");

  // Add tests to category modal states
  const [showAddTestsModal, setShowAddTestsModal] = useState(false);
  const [addTestsCategory, setAddTestsCategory] = useState<Category | null>(
    null
  );
  const [addTestsMode, setAddTestsMode] = useState<"existing" | "new">(
    "existing"
  );
  const [addTestsLevelIndex, setAddTestsLevelIndex] = useState<number>(0);
  const [addTestsNewLevelName, setAddTestsNewLevelName] = useState("");
  const [addTestsFile, setAddTestsFile] = useState<File | null>(null);
  const [addTestsQuestions, setAddTestsQuestions] = useState<any[]>([]);
  const [addTestsParsed, setAddTestsParsed] = useState(false);
  const [addingTests, setAddingTests] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

  // Parse TXT file to questions - supports multiple formats
  const parseTxtFile = (content: string): any[] => {
    const questions: any[] = [];
    // Handle different line endings
    const normalizedContent = content
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n");
    const lines = normalizedContent.split("\n");

    console.log("=== TXT PARSER DEBUG ===");
    console.log("Total lines in file:", lines.length);

    let i = 0;
    while (i < lines.length) {
      const line = lines[i].trim();

      // Skip empty lines and headers
      if (!line || line.includes("====") || line.includes("---")) {
        i++;
        continue;
      }

      // Try to match question start: "1. question" or "1) question"
      const questionStartMatch = line.match(/^(\d+)[\.\)]\s*(.+)/);

      if (questionStartMatch) {
        const questionNum = questionStartMatch[1];
        let questionText = questionStartMatch[2];
        let options: string[] = ["", "", "", ""];
        let correctAnswer = -1;

        // FORMAT 1: Single line - everything in one line
        // "1. Question? A) opt1 B) opt2 C) opt3 D) opt4 Javob: A"
        const singleLineMatch = line.match(
          /^(\d+)[\.\)]\s*(.+?)\s+A[\)\.\:]?\s*(.+?)\s+B[\)\.\:]?\s*(.+?)\s+C[\)\.\:]?\s*(.+?)\s+D[\)\.\:]?\s*(.+?)\s+(?:Javob|Answer|To'g'ri javob)\s*:\s*([A-Da-d])/i
        );

        if (singleLineMatch) {
          questions.push({
            question: singleLineMatch[2].trim(),
            options: [
              singleLineMatch[3].trim(),
              singleLineMatch[4].trim(),
              singleLineMatch[5].trim(),
              singleLineMatch[6].trim(),
            ],
            correctAnswer: singleLineMatch[7].toUpperCase().charCodeAt(0) - 65,
          });
          i++;
          continue;
        }

        // FORMAT 2 & 3: Multi-line formats
        // Look ahead to collect options and answer
        let j = i + 1;
        let foundAllOptions = false;

        while (j < lines.length && j < i + 20) {
          const nextLine = lines[j].trim();

          // Skip empty lines
          if (!nextLine) {
            j++;
            continue;
          }

          // Check if next question started (but not if line starts with A-D option)
          if (
            /^(\d+)[\.\)]\s*/.test(nextLine) &&
            !/^[A-Da-d][\)\.\:]/i.test(nextLine)
          ) {
            break;
          }

          // Check for options: "A) text" or "A. text" or "A: text" or "A text" (with space)
          const optMatch = nextLine.match(/^([A-Da-d])[\)\.\:\s]\s*(.+)/);
          if (optMatch) {
            const optIndex = optMatch[1].toUpperCase().charCodeAt(0) - 65;
            let optText = optMatch[2].trim();

            // Remove answer hint like "(Tomoni 8 sm)" from end
            optText = optText.replace(/\s*\([^)]*\)\s*$/, "").trim();

            if (optIndex >= 0 && optIndex <= 3) {
              options[optIndex] = optText;
            }
            j++;
            continue;
          }

          // Check for answer: "Javob: A" or "Javob: A (explanation)"
          const ansMatch = nextLine.match(
            /^(?:Javob|To'g'ri javob|Answer|Tog'ri javob)\s*:\s*([A-Da-d])/i
          );
          if (ansMatch) {
            correctAnswer = ansMatch[1].toUpperCase().charCodeAt(0) - 65;
            j++;
            break;
          }

          j++;
        }

        // Check if we got a valid question
        const hasAllOptions = options.every((opt) => opt !== "");

        if (hasAllOptions && correctAnswer >= 0) {
          questions.push({
            question: questionText,
            options: options,
            correctAnswer: correctAnswer,
          });
        }

        i = j;
        continue;
      }

      i++;
    }

    console.log("=== PARSED RESULT ===");
    console.log("Total questions found:", questions.length);
    if (questions.length > 0) {
      console.log("First question:", questions[0]);
      console.log("Last question:", questions[questions.length - 1]);
    }
    return questions;
  };

  const handleLevelFileUpload = async (levelId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const questions = parseTxtFile(content);

      setQuestionLevels((prev) =>
        prev.map((level) =>
          level.id === levelId
            ? {
                ...level,
                file,
                questions,
                parsed: true,
                count: questions.length,
              }
            : level
        )
      );

      if (questions.length < 100) {
        toast.error(
          `"${file.name}" da faqat ${questions.length} ta savol topildi. Minimum 100 ta kerak!`
        );
      } else {
        toast.success(`${questions.length} ta savol muvaffaqiyatli o'qildi`);
      }
    };
    reader.readAsText(file);
  };

  const addNewLevel = () => {
    const newId = String(questionLevels.length + 1);
    setQuestionLevels([
      ...questionLevels,
      {
        id: newId,
        name: "",
        file: null,
        questions: [],
        parsed: false,
        count: 0,
      },
    ]);
  };

  const removeLevel = (levelId: string) => {
    if (questionLevels.length <= 3) {
      toast.error("Minimum 3 ta daraja bo'lishi kerak");
      return;
    }
    setQuestionLevels((prev) => prev.filter((l) => l.id !== levelId));
  };

  const updateLevelName = (levelId: string, name: string) => {
    setQuestionLevels((prev) =>
      prev.map((level) => (level.id === levelId ? { ...level, name } : level))
    );
  };

  // Handle add tests file upload
  const handleAddTestsFileUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const questions = parseTxtFile(content);

      setAddTestsFile(file);
      setAddTestsQuestions(questions);
      setAddTestsParsed(true);

      if (questions.length === 0) {
        toast.error(`Fayldan savollar topilmadi`);
      } else {
        toast.success(`${questions.length} ta savol muvaffaqiyatli o'qildi`);
      }
    };
    reader.readAsText(file);
  };

  // Add tests to category
  const handleAddTestsToCategory = async () => {
    if (!addTestsCategory) return;

    if (addTestsQuestions.length === 0) {
      toast.error("Avval TXT fayl yuklang");
      return;
    }

    // Determine level index and name
    let levelIndex = addTestsLevelIndex;
    let difficultyLevels = addTestsCategory.difficultyLevels || [
      "Oson",
      "O'rta",
      "Qiyin",
    ];

    if (addTestsMode === "new") {
      if (!addTestsNewLevelName.trim()) {
        toast.error("Yangi daraja nomini kiriting");
        return;
      }
      // Add new level to category
      levelIndex = difficultyLevels.length;
      difficultyLevels = [...difficultyLevels, addTestsNewLevelName.trim()];

      // Update category with new level
      try {
        const updateRes = await fetch(
          `${API}/admin/categories/${addTestsCategory.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ difficultyLevels }),
          }
        );

        if (!updateRes.ok) {
          toast.error("Yangi daraja qo'shishda xatolik");
          return;
        }
      } catch (error) {
        toast.error("Server xatosi");
        return;
      }
    }

    setAddingTests(true);
    try {
      // Map difficulty based on level index
      const getDifficulty = (
        idx: number,
        total: number
      ): "EASY" | "MEDIUM" | "HARD" => {
        if (idx === 0) return "EASY";
        if (idx === total - 1) return "HARD";
        return "MEDIUM";
      };

      // Format questions for backend with levelIndex
      const questionsForImport = addTestsQuestions.map((q) => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        difficulty: getDifficulty(levelIndex, difficultyLevels.length),
        levelIndex: levelIndex,
      }));

      const importRes = await fetch(`${API}/admin/questions/import`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          categoryId: addTestsCategory.id,
          questions: questionsForImport,
        }),
      });

      if (importRes.ok) {
        const data = await importRes.json();
        toast.success(
          `${data.imported || questionsForImport.length} ta savol qo'shildi!`
        );
        resetAddTestsModal();
        fetchCategories();
      } else {
        const errData = await importRes.json().catch(() => ({}));
        toast.error(errData.message || "Import xatosi");
      }
    } catch (error) {
      toast.error("Server xatosi");
    } finally {
      setAddingTests(false);
    }
  };

  const resetAddTestsModal = () => {
    setShowAddTestsModal(false);
    setAddTestsCategory(null);
    setAddTestsMode("existing");
    setAddTestsLevelIndex(0);
    setAddTestsNewLevelName("");
    setAddTestsFile(null);
    setAddTestsQuestions([]);
    setAddTestsParsed(false);
  };

  const openAddTestsModal = (category: Category) => {
    setAddTestsCategory(category);
    setAddTestsMode("existing");
    setAddTestsLevelIndex(0);
    setAddTestsNewLevelName("");
    setAddTestsFile(null);
    setAddTestsQuestions([]);
    setAddTestsParsed(false);
    setShowAddTestsModal(true);
  };

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Faqat rasm fayllari qabul qilinadi");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Rasm hajmi 2MB dan oshmasligi kerak");
      return;
    }

    setUploadingIcon(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API}/upload/attachment`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const iconUrl = data.url || data.path;
        setNewCategory({ ...newCategory, icon: iconUrl });
        setIconPreview(iconUrl);
        toast.success("Rasm yuklandi");
      } else {
        toast.error("Rasm yuklashda xatolik");
      }
    } catch (error) {
      toast.error("Server xatosi");
    } finally {
      setUploadingIcon(false);
    }
  };

  useEffect(() => {
    if (token) fetchCategories();
  }, [token]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API}/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Fetch categories error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) {
      toast.error("Kategoriya nomini kiriting");
      return;
    }

    // Validate custom group name
    if (newCategory.group === "custom" && !customGroupName.trim()) {
      toast.error("Yangi guruh nomini kiriting");
      return;
    }

    // Step 1: Info validation
    if (createStep === "info") {
      setCreateStep("questions");
      return;
    }

    // Step 2: Questions validation
    const validLevels = questionLevels.filter(
      (l) => l.name.trim() && l.count >= 100
    );
    if (validLevels.length < 3) {
      toast.error(
        "Minimum 3 ta daraja va har birida 100+ savol bo'lishi kerak"
      );
      return;
    }

    setCreatingCategory(true);
    try {
      // Determine final group - use custom name as group id (slug format)
      const finalGroup =
        newCategory.group === "custom"
          ? customGroupName
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, "")
          : newCategory.group;

      // Generate slug from name
      const slug = newCategory.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

      // Get difficulty level names from question levels (in order)
      const difficultyLevels = validLevels.map((l) => l.name);

      // Create category first
      const res = await fetch(`${API}/admin/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newCategory.name,
          slug: slug,
          icon: newCategory.icon || null,
          group: finalGroup,
          difficultyLevels: difficultyLevels,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.message || "Kategoriya yaratishda xatolik");
        setCreatingCategory(false);
        return;
      }

      const category = await res.json();

      // Import questions for each level using bulk import endpoint
      let totalImported = 0;
      for (let levelIndex = 0; levelIndex < validLevels.length; levelIndex++) {
        const level = validLevels[levelIndex];

        // Map difficulty based on level index (first = EASY, middle = MEDIUM, last = HARD)
        const getDifficulty = (
          idx: number,
          total: number
        ): "EASY" | "MEDIUM" | "HARD" => {
          if (idx === 0) return "EASY";
          if (idx === total - 1) return "HARD";
          return "MEDIUM";
        };

        // Format questions for backend with levelIndex
        const questionsForImport = level.questions.map((q) => ({
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          difficulty: getDifficulty(levelIndex, validLevels.length),
          levelIndex: levelIndex,
        }));

        const importRes = await fetch(`${API}/admin/questions/import`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            categoryId: category.id,
            questions: questionsForImport,
          }),
        });

        if (importRes.ok) {
          const data = await importRes.json();
          totalImported += data.imported || questionsForImport.length;
        } else {
          const errData = await importRes.json().catch(() => ({}));
          console.error("Import error for level", level.name, errData);
        }
      }

      toast.success(
        `Kategoriya yaratildi va ${totalImported} ta savol import qilindi!`
      );
      resetCreateModal();
      fetchCategories();
    } catch (error) {
      toast.error("Server xatosi");
    } finally {
      setCreatingCategory(false);
    }
  };

  const resetCreateModal = () => {
    setShowCreateModal(false);
    setNewCategory({ name: "", icon: "", group: "programming" });
    setCustomGroupName("");
    setIconType("emoji");
    setIconPreview(null);
    setCreateStep("info");
    setQuestionLevels([
      {
        id: "1",
        name: "Oson",
        file: null,
        questions: [],
        parsed: false,
        count: 0,
      },
      {
        id: "2",
        name: "O'rta",
        file: null,
        questions: [],
        parsed: false,
        count: 0,
      },
      {
        id: "3",
        name: "Qiyin",
        file: null,
        questions: [],
        parsed: false,
        count: 0,
      },
    ]);
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Bu kategoriyani o'chirishni xohlaysizmi?")) return;

    try {
      const res = await fetch(`${API}/admin/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast.success("Kategoriya o'chirildi");
        fetchCategories();
      } else {
        toast.error("O'chirishda xatolik");
      }
    } catch (error) {
      toast.error("Server xatosi");
    }
  };

  const handleImportQuestions = async () => {
    if (!selectedCategory || !importData.trim()) {
      toast.error("Ma'lumotlarni kiriting");
      return;
    }

    setImporting(true);
    try {
      let questions = [];
      try {
        questions = JSON.parse(importData);
      } catch {
        toast.error("JSON formatida xatolik");
        setImporting(false);
        return;
      }

      if (!Array.isArray(questions) || questions.length === 0) {
        toast.error("Savollar massivi bo'lishi kerak");
        setImporting(false);
        return;
      }

      const res = await fetch(
        `${API}/admin/categories/${selectedCategory.id}/import-questions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ questions }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        toast.success(
          `${data.imported || questions.length} ta savol import qilindi`
        );
        setShowImportModal(false);
        setImportData("");
        setSelectedCategory(null);
        fetchCategories();
      } else {
        const data = await res.json();
        toast.error(data.message || "Import xatosi");
      }
    } catch (error) {
      toast.error("Server xatosi");
    } finally {
      setImporting(false);
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Kategoriyalar
        </h1>
        <button
          onClick={() => setShowCreateModal(true)}
          disabled={isReadOnly}
          className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${
            isReadOnly ? "opacity-50 cursor-not-allowed" : ""
          }`}
          title={
            isReadOnly ? "Faqat ko'rish rejimi" : "Yangi kategoriya qo'shish"
          }
        >
          + Yangi
        </button>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Qidirish..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          🔍
        </span>
      </div>

      <div className="grid gap-4">
        {filteredCategories.map((category) => {
          // Icon path - markaziy funksiyadan olish
          const iconPath = getCategoryIconUrl(category.slug, category.icon);

          const isImageIcon =
            iconPath &&
            (iconPath.startsWith("/uploads/") ||
              iconPath.startsWith("/img/") ||
              iconPath.startsWith("http") ||
              iconPath.endsWith(".png") ||
              iconPath.endsWith(".jpg") ||
              iconPath.endsWith(".svg"));

          return (
            <div
              key={category.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                {isImageIcon && iconPath ? (
                  <img
                    src={iconPath}
                    alt={category.name}
                    className="w-12 h-12 rounded-lg object-contain bg-gray-100 dark:bg-gray-700 p-1"
                  />
                ) : iconPath ? (
                  <span className="text-3xl">{iconPath}</span>
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {category.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {category.name}
                  </h3>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>{category.questionsCount || 0} savol</span>
                    <span>{category.testsCount || 0} test</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    (category.questionsCount || 0) >= 300
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                  }`}
                >
                  {(category.questionsCount || 0) >= 300
                    ? "300+"
                    : `${category.questionsCount || 0}/300`}
                </span>
                {!isReadOnly && (
                  <>
                    <button
                      onClick={() => openAddTestsModal(category)}
                      className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                      title="Test qo'shish (TXT)"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCategory(category);
                        setShowImportModal(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      title="Import (JSON)"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="O'chirish"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Kategoriyalar topilmadi
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl my-8 max-h-[90vh] overflow-y-auto">
            {/* Steps indicator */}
            <div className="flex items-center gap-4 mb-6">
              <div
                className={`flex items-center gap-2 ${
                  createStep === "info" ? "text-blue-600" : "text-green-600"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    createStep === "info"
                      ? "bg-blue-600 text-white"
                      : "bg-green-600 text-white"
                  }`}
                >
                  {createStep === "questions" ? "✓" : "1"}
                </div>
                <span className="font-medium">Ma'lumotlar</span>
              </div>
              <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded">
                <div
                  className={`h-full bg-blue-600 rounded transition-all ${
                    createStep === "questions" ? "w-full" : "w-0"
                  }`}
                ></div>
              </div>
              <div
                className={`flex items-center gap-2 ${
                  createStep === "questions" ? "text-blue-600" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    createStep === "questions"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                >
                  2
                </div>
                <span className="font-medium">Savollar</span>
              </div>
            </div>

            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              {createStep === "info" ? "Yangi kategoriya" : "Savollar yuklash"}
            </h2>

            {/* Step 1: Category Info */}
            {createStep === "info" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Kategoriya nomi *
                  </label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, name: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="React, Vue.js, Angular..."
                  />
                </div>

                {/* Group selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Kategoriya guruhi *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORY_GROUPS.map((group) => (
                      <button
                        key={group.id}
                        type="button"
                        onClick={() => {
                          setNewCategory({ ...newCategory, group: group.id });
                          if (group.id !== "custom") setCustomGroupName("");
                        }}
                        className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                          newCategory.group === group.id
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                            : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300"
                        }`}
                      >
                        {group.name}
                      </button>
                    ))}
                  </div>

                  {/* Custom group name input */}
                  {newCategory.group === "custom" && (
                    <div className="mt-3">
                      <input
                        type="text"
                        value={customGroupName}
                        onChange={(e) => setCustomGroupName(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-blue-300 dark:border-blue-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                        placeholder="Yangi guruh nomi (masalan: Mobile, AI, Blockchain...)"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Bu nom foydalanuvchi kategoriyalar sahifasida yangi tab
                        sifatida ko'rinadi
                      </p>
                    </div>
                  )}
                </div>

                {/* Icon type selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Icon turi
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIconType("emoji");
                        setNewCategory({ ...newCategory, icon: "" });
                        setIconPreview(null);
                      }}
                      className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                        iconType === "emoji"
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                          : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      😀 Emoji
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIconType("image");
                        setNewCategory({ ...newCategory, icon: "" });
                        setIconPreview(null);
                      }}
                      className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                        iconType === "image"
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                          : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      🖼️ Rasm
                    </button>
                  </div>
                </div>

                {/* Icon input */}
                {iconType === "emoji" ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Icon (emoji)
                    </label>
                    <input
                      type="text"
                      value={newCategory.icon}
                      onChange={(e) =>
                        setNewCategory({ ...newCategory, icon: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-2xl"
                      placeholder="⚛️"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Icon (rasm)
                    </label>
                    <input
                      ref={iconInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleIconUpload}
                      className="hidden"
                      title="Icon rasmini tanlash"
                      aria-label="Icon rasmini tanlash"
                    />

                    {iconPreview ? (
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-100 dark:bg-gray-900">
                          <img
                            src={getUploadUrl(iconPreview) || iconPreview}
                            alt="Icon preview"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIconPreview(null);
                            setNewCategory({ ...newCategory, icon: "" });
                            if (iconInputRef.current)
                              iconInputRef.current.value = "";
                          }}
                          className="px-3 py-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm"
                        >
                          O'chirish
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => iconInputRef.current?.click()}
                        disabled={uploadingIcon}
                        className="w-full px-4 py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {uploadingIcon ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        ) : (
                          <>
                            <svg
                              className="w-5 h-5 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <span className="text-gray-500 dark:text-gray-400 text-sm">
                              Rasm yuklash
                            </span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Questions */}
            {createStep === "questions" && (
              <div className="space-y-4">
                {/* Sample format */}
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <p className="font-medium text-amber-800 dark:text-amber-300 mb-2">
                    📝 Qo'llab-quvvatlanadigan TXT formatlar:
                  </p>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">
                        Format 1 - Bir qatorda:
                      </p>
                      <pre className="text-xs text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 p-2 rounded overflow-x-auto">
                        {`1. 5 + 7 nechaga teng? A) 12 B) 10 C) 15 D) 14 Javob: A
2. 15 - 8 ayirmani toping A) 7 B) 8 C) 6 D) 9 Javob: A`}
                      </pre>
                    </div>

                    <div>
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">
                        Format 2 - Ko'p qatorli:
                      </p>
                      <pre className="text-xs text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 p-2 rounded overflow-x-auto">
                        {`1. 240 sonining 15% ini toping.
A) 36  B) 30  C) 42  D) 24
Javob: A

2. Kvadratning yuzi 64 sm² bo'lsa, perimetrini toping.
A) 32 sm  B) 16 sm  C) 64 sm  D) 24 sm
Javob: A`}
                      </pre>
                    </div>

                    <div>
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">
                        Format 3 - Har variant alohida:
                      </p>
                      <pre className="text-xs text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 p-2 rounded overflow-x-auto">
                        {`1. React kim tomonidan yaratilgan?
A) Google
B) Facebook (Meta)
C) Microsoft
D) Amazon
Javob: B`}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Question levels */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Qiyinlik darajalari (minimum 3 ta, har birida 100+ savol)
                    </label>
                    <button
                      type="button"
                      onClick={addNewLevel}
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Yangi daraja
                    </button>
                  </div>

                  {questionLevels.map((level, index) => (
                    <div
                      key={level.id}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <input
                          type="text"
                          value={level.name}
                          onChange={(e) =>
                            updateLevelName(level.id, e.target.value)
                          }
                          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                          placeholder="Oson, O'rta, Qiyin, 2024..."
                        />
                        {questionLevels.length > 3 && (
                          <button
                            type="button"
                            onClick={() => removeLevel(level.id)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                            title="Darajani o'chirish"
                            aria-label="Darajani o'chirish"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        )}
                      </div>

                      {/* File upload */}
                      <div>
                        <input
                          type="file"
                          accept=".txt"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleLevelFileUpload(level.id, file);
                          }}
                          className="hidden"
                          id={`file-${level.id}`}
                        />
                        <label
                          htmlFor={`file-${level.id}`}
                          className={`flex items-center justify-between p-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                            level.parsed
                              ? level.count >= 100
                                ? "border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20"
                                : "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20"
                              : "border-gray-300 dark:border-gray-600 hover:border-blue-500"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <svg
                              className={`w-5 h-5 ${
                                level.parsed
                                  ? level.count >= 100
                                    ? "text-green-500"
                                    : "text-red-500"
                                  : "text-gray-400"
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            <span
                              className={`text-sm ${
                                level.parsed
                                  ? level.count >= 100
                                    ? "text-green-700 dark:text-green-400"
                                    : "text-red-700 dark:text-red-400"
                                  : "text-gray-500 dark:text-gray-400"
                              }`}
                            >
                              {level.file
                                ? level.file.name
                                : "TXT fayl yuklash"}
                            </span>
                          </div>
                          {level.parsed && (
                            <span
                              className={`text-sm font-medium ${
                                level.count >= 100
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {level.count} ta savol{" "}
                              {level.count >= 100 ? "✓" : "(min 100)"}
                            </span>
                          )}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Jami savollar:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {questionLevels.reduce((sum, l) => sum + l.count, 0)} ta
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-gray-600 dark:text-gray-400">
                      Tayyor darajalar:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {
                        questionLevels.filter(
                          (l) => l.name.trim() && l.count >= 100
                        ).length
                      }{" "}
                      / {questionLevels.length}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  if (createStep === "questions") {
                    setCreateStep("info");
                  } else {
                    resetCreateModal();
                  }
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300"
              >
                {createStep === "questions" ? "Orqaga" : "Bekor qilish"}
              </button>
              <button
                onClick={handleCreateCategory}
                disabled={
                  creatingCategory ||
                  (createStep === "info" && !newCategory.name.trim())
                }
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {creatingCategory ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Yaratilmoqda...
                  </>
                ) : createStep === "info" ? (
                  "Keyingi →"
                ) : (
                  "Yaratish"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showImportModal && selectedCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
              Savollar import qilish (JSON)
            </h2>
            <p className="text-gray-500 mb-4">
              {selectedCategory.name} kategoriyasiga
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  JSON formatida savollar
                </label>
                <textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  rows={12}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm"
                  placeholder='[{"question": "Savol?", "options": ["A", "B", "C", "D"], "correctAnswer": 0}]'
                />
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
                <p className="font-medium text-blue-700 dark:text-blue-300 mb-1">
                  Format:
                </p>
                <ul className="text-blue-600 dark:text-blue-400 list-disc list-inside space-y-1">
                  <li>question - savol matni</li>
                  <li>options - 4 ta javob varianti</li>
                  <li>correctAnswer - to'g'ri javob indeksi (0-3)</li>
                </ul>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportData("");
                  setSelectedCategory(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleImportQuestions}
                disabled={importing}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {importing ? "Import qilinmoqda..." : "Import qilish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Tests Modal (TXT format) */}
      {showAddTestsModal && addTestsCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
              Test qo'shish (TXT)
            </h2>
            <p className="text-gray-500 mb-4">
              {addTestsCategory.name} kategoriyasiga test qo'shish
            </p>

            {/* Mode selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Daraja tanlash
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAddTestsMode("existing")}
                  className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                    addTestsMode === "existing"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Mavjud daraja
                </button>
                <button
                  type="button"
                  onClick={() => setAddTestsMode("new")}
                  className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                    addTestsMode === "new"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  + Yangi daraja
                </button>
              </div>
            </div>

            {/* Existing levels selector */}
            {addTestsMode === "existing" && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Qaysi darajaga qo'shish kerak?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    addTestsCategory.difficultyLevels || [
                      "Oson",
                      "O'rta",
                      "Qiyin",
                    ]
                  ).map((level, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setAddTestsLevelIndex(index)}
                      className={`px-4 py-3 rounded-lg border text-sm transition-colors ${
                        addTestsLevelIndex === index
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                          : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300"
                      }`}
                    >
                      <span className="font-medium">{level}</span>
                      <span className="block text-xs text-gray-500 mt-1">
                        Daraja #{index + 1}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* New level name input */}
            {addTestsMode === "new" && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Yangi daraja nomi
                </label>
                <input
                  type="text"
                  value={addTestsNewLevelName}
                  onChange={(e) => setAddTestsNewLevelName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  placeholder="Masalan: 2025, Expert, Olimpiada..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Bu daraja #
                  {(
                    addTestsCategory.difficultyLevels || [
                      "Oson",
                      "O'rta",
                      "Qiyin",
                    ]
                  ).length + 1}{" "}
                  sifatida qo'shiladi
                </p>
              </div>
            )}

            {/* File upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                TXT fayl yuklash
              </label>
              <input
                type="file"
                accept=".txt"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleAddTestsFileUpload(file);
                }}
                className="hidden"
                id="add-tests-file"
              />
              <label
                htmlFor="add-tests-file"
                className={`flex items-center justify-between p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                  addTestsParsed
                    ? addTestsQuestions.length > 0
                      ? "border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20"
                      : "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20"
                    : "border-gray-300 dark:border-gray-600 hover:border-blue-500"
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg
                    className={`w-6 h-6 ${
                      addTestsParsed
                        ? addTestsQuestions.length > 0
                          ? "text-green-500"
                          : "text-red-500"
                        : "text-gray-400"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span
                    className={`text-sm ${
                      addTestsParsed
                        ? addTestsQuestions.length > 0
                          ? "text-green-700 dark:text-green-400"
                          : "text-red-700 dark:text-red-400"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {addTestsFile ? addTestsFile.name : "TXT fayl tanlash"}
                  </span>
                </div>
                {addTestsParsed && (
                  <span
                    className={`text-sm font-medium ${
                      addTestsQuestions.length > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {addTestsQuestions.length} ta savol{" "}
                    {addTestsQuestions.length > 0 ? "✓" : "⚠️"}
                  </span>
                )}
              </label>
            </div>

            {/* Format help */}
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 mb-6">
              <p className="font-medium text-amber-800 dark:text-amber-300 mb-2">
                📝 TXT format namunasi:
              </p>
              <pre className="text-xs text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 p-2 rounded overflow-x-auto">
                {`1. 5 + 7 nechaga teng? A) 12 B) 10 C) 15 D) 14 Javob: A
2. 15 - 8 ayirmani toping A) 7 B) 8 C) 6 D) 9 Javob: A`}
              </pre>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                yoki ko'p qatorli format:
              </p>
              <pre className="text-xs text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 p-2 rounded overflow-x-auto mt-1">
                {`1. Savol matni?
A) Variant 1
B) Variant 2
C) Variant 3
D) Variant 4
Javob: A`}
              </pre>
            </div>

            {/* Summary */}
            {addTestsParsed && (
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Qo'shiladigan savollar:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {addTestsQuestions.length} ta
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-gray-600 dark:text-gray-400">
                    Daraja:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {addTestsMode === "new"
                      ? addTestsNewLevelName || "(yangi)"
                      : (addTestsCategory.difficultyLevels || [
                          "Oson",
                          "O'rta",
                          "Qiyin",
                        ])[addTestsLevelIndex]}
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={resetAddTestsModal}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleAddTestsToCategory}
                disabled={
                  addingTests ||
                  addTestsQuestions.length === 0 ||
                  (addTestsMode === "new" && !addTestsNewLevelName.trim())
                }
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {addingTests ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Qo'shilmoqda...
                  </>
                ) : (
                  `${addTestsQuestions.length} ta savol qo'shish`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
