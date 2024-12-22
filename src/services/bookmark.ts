export interface BookmarkInfo {
  id: string;
  title: string;
  url: string;
}

export class BookmarkService {
  async getAll(): Promise<BookmarkInfo[]> {
    try {
      const tree = await chrome.bookmarks.getTree();
      const bookmarks = this.flattenBookmarkTree(tree);

      return bookmarks
        .filter(bookmark => bookmark.url)
        .map(bookmark => ({
          id: bookmark.id,
          title: bookmark.title || "",
          url: bookmark.url || ""
        }));
    } catch (error) {
      console.error('Error searching bookmarks:', error);
      return [];
    }
  }

  async openBookmarkInNewTab(url: string): Promise<chrome.tabs.Tab | null> {
    try {
      return await chrome.tabs.create({ url });
    } catch (error) {
      console.error('Error opening bookmark:', error);
      return null;
    }
  }

  private flattenBookmarkTree(tree: chrome.bookmarks.BookmarkTreeNode[]): chrome.bookmarks.BookmarkTreeNode[] {
    const bookmarks: chrome.bookmarks.BookmarkTreeNode[] = [];

    function traverse(node: chrome.bookmarks.BookmarkTreeNode) {
      if (node.url) {
        bookmarks.push(node);
      }
      if (node.children) {
        node.children.forEach(traverse);
      }
    }

    tree.forEach(traverse);
    return bookmarks;
  }
}