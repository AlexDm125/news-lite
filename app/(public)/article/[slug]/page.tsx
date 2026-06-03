import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import Link from "next/link";
import CommentForm from "@/components/CommentForm";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  const decodedSlug = decodeURIComponent(slug);

  const news = await prisma.news.findFirst({
    where: {
      slug: decodedSlug,
      status: "PUBLISHED",
    },
    include: {
      author: true,
      category: true,
      comments: {
        where: { status: "ACTIVE" },
        include: { user: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!news) {
    notFound();
  }

  const session = await auth();
  const authorInitials = news.author.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const renderContent = (content: any) => {
    if (!content || !content.blocks || !Array.isArray(content.blocks)) return null;
    
    const elements: any[] = [];
    
    for (let idx = 0; idx < content.blocks.length; idx++) {
      const block = content.blocks[idx];
      
      if (!block || typeof block !== 'object' || !block.type) continue;
      
      let element = null;
      
      try {
        switch (block.type) {
          case "paragraph":
            element = (
              <p key={idx} className="text-gray-700 leading-relaxed mb-6">
                {block.data?.text || ""}
              </p>
            );
            break;
          case "header":
            const level = block.data?.level || 2;
            const Tag = `h${level}` as keyof JSX.IntrinsicElements;
            element = (
              <Tag key={idx} className="font-bold text-gray-900 mb-4 mt-8">
                {block.data?.text || ""}
              </Tag>
            );
            break;
          case "list":
          case "nestedlist":
            const ListTag = block.data?.style === "ordered" ? "ol" : "ul";
            let items = [];
            if (Array.isArray(block.data?.items)) {
              items = block.data.items;
            } else if (Array.isArray(block.data?.content)) {
              items = block.data.content;
            }
            element = (
              <ListTag key={idx} className={`list-inside text-gray-700 space-y-2 mb-6 ${block.data?.style === "ordered" ? "list-decimal" : "list-disc"}`}>
                {items.map((item: any, i: number) => (
                  <li key={i}>{typeof item === 'string' ? item : item?.content || ''}</li>
                ))}
              </ListTag>
            );
            break;
          case "image":
            const imageUrl = block.data?.file?.url;
            if (imageUrl) {
              element = (
                <figure key={idx} className="my-8">
                  <img
                    src={imageUrl}
                    alt={block.data?.caption || "Article image"}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                  {block.data?.caption && (
                    <figcaption className="text-center text-sm text-gray-500 mt-2">
                      {block.data.caption}
                    </figcaption>
                  )}
                </figure>
              );
            }
            break;
          case "quote":
            element = (
              <blockquote key={idx} className="border-l-4 border-blue-600 pl-4 py-2 mb-6 italic text-gray-700">
                {block.data?.text || ""}
                {block.data?.caption && (
                  <footer className="text-sm text-gray-600 mt-2">— {block.data.caption}</footer>
                )}
              </blockquote>
            );
            break;
          case "code":
            element = (
              <pre key={idx} className="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-6">
                <code className="text-sm text-gray-800">{block.data?.code || ""}</code>
              </pre>
            );
            break;
          case "table":
            const rows = block.data?.content || [];
            if (Array.isArray(rows) && rows.length > 0) {
              element = (
                <div key={idx} className="overflow-x-auto mb-6">
                  <table className="min-w-full border border-gray-300">
                    <tbody>
                      {rows.map((row: any, rowIdx: number) => (
                        <tr key={rowIdx} className={rowIdx === 0 && block.data?.withHeadings ? "bg-gray-100" : ""}>
                          {Array.isArray(row) ? row.map((cell: any, cellIdx: number) => (
                            <td key={cellIdx} className="border border-gray-300 px-4 py-2">
                              {typeof cell === 'string' ? cell : String(cell || '')}
                            </td>
                          )) : (
                            <td className="border border-gray-300 px-4 py-2">
                              {String(row || '')}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            }
            break;
          case "delimiter":
            element = <hr key={idx} className="my-8 border-gray-300" />;
            break;
          case "checklist":
            const checklistItems = block.data?.items || [];
            if (Array.isArray(checklistItems) && checklistItems.length > 0) {
              element = (
                <div key={idx} className="space-y-3 mb-6">
                  {checklistItems.map((item: any, i: number) => (
                    <div key={i} className="flex items-start">
                      <input 
                        type="checkbox" 
                        checked={item?.checked || false} 
                        readOnly 
                        className="mt-1 mr-3"
                      />
                      <span className="text-gray-700">{item?.text || String(item) || ""}</span>
                    </div>
                  ))}
                </div>
              );
            }
            break;
        }
      } catch (e) {
        console.error(`Error rendering block ${idx}:`, e);
      }
      
      if (element) {
        elements.push(element);
      }
    }
    
    return elements.length > 0 ? elements : null;
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/" className="text-blue-600 hover:text-blue-700 mb-6 inline-block">
        ← Повернутися до новин
      </Link>
      
      <article className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Article Header */}
        <div className="p-8">
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              {news.category.name}
            </span>
            <span className="text-sm text-gray-500">
              {news.publishedAt ? new Date(news.publishedAt).toLocaleDateString("uk-UA", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}
            </span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{news.title}</h1>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              {authorInitials}
            </div>
            <div>
              <p className="font-medium text-gray-900">{news.author.name}</p>
              <p className="text-sm text-gray-500">Автор</p>
            </div>
          </div>
        </div>


        {/* Article Body */}
        <div className="p-8 pt-4">
          <div className="prose max-w-none">
            {renderContent(news.content)}
          </div>
        </div>
      </article>

      {/* Comments Section */}
      <div className="bg-white rounded-lg shadow-md mt-8 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Коментарі ({news.comments.length})
        </h2>

        {/* Comments List */}
        {news.comments.length > 0 ? (
          <div className="space-y-6 mb-8">
            {news.comments.map((comment) => {
              const userInitials = comment.user.name
                .split(" ")
                .slice(0, 2)
                .map((n) => n[0])
                .join("")
                .toUpperCase();

              return (
                <div key={comment.id} className="pb-6 border-b border-gray-200 last:border-b-0">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {userInitials}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="font-medium text-gray-900">{comment.user.name}</p>
                        <span className="text-sm text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString("uk-UA")}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 mb-8">Коментарів ще нема. Будьте першим!</p>
        )}

        {/* Comment Form */}
        <div className="mt-8 pt-8 border-t border-gray-200" data-comments-section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Залишити коментар</h3>
          {session?.user ? (
            <CommentForm newsId={news.id} newsSlug={news.slug} />
          ) : (
            <p className="text-gray-600">
              <Link href="/login" className="text-blue-600 hover:text-blue-700">
                Увійдіть
              </Link>
              {" "}або{" "}
              <Link href="/register" className="text-blue-600 hover:text-blue-700">
                зареєструйтесь
              </Link>
              , щоб залишити коментар.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
