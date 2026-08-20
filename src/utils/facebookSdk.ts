/**
 * Facebook JavaScript SDK Loader & Manager
 * Provides reliable, official Facebook Login, Page Discovery, and Graph API Publishing.
 */

declare global {
  interface Window {
    fbAsyncInit?: () => void;
    FB?: {
      init: (options: {
        appId: string;
        cookie?: boolean;
        xfbml?: boolean;
        version: string;
      }) => void;
      login: (
        callback: (response: FacebookLoginResponse) => void,
        options?: { scope: string; return_scopes?: boolean }
      ) => void;
      getLoginStatus: (callback: (response: FacebookLoginResponse) => void) => void;
      api: (path: string, methodOrParams?: any, paramsOrCallback?: any, callback?: any) => void;
      AppEvents?: {
        logPageView: () => void;
      };
    };
  }
}

export interface FacebookLoginResponse {
  status: "connected" | "not_authorized" | "unknown";
  authResponse?: {
    accessToken: string;
    expiresIn: number;
    signedRequest: string;
    userID: string;
    grantedScopes?: string;
  };
}

export interface FacebookPageItem {
  id: string;
  name: string;
  category: string;
  access_token: string;
  tasks?: string[];
  fan_count?: number;
  picture?: {
    data?: {
      url?: string;
    };
  };
  link?: string;
}

const DEFAULT_META_APP_ID = "2577688929355697"; // SmartPost365 Meta App Default or Configurable
const SDK_VERSION = "v19.0";

let isSdkLoading = false;
let isSdkReady = false;
let sdkInitPromise: Promise<boolean> | null = null;

export const getStoredFacebookAppId = (): string => {
  if (typeof window === "undefined") return DEFAULT_META_APP_ID;
  return localStorage.getItem("smartpost_meta_app_id") || DEFAULT_META_APP_ID;
};

export const saveStoredFacebookAppId = (appId: string): void => {
  if (typeof window !== "undefined" && appId) {
    localStorage.setItem("smartpost_meta_app_id", appId.trim());
  }
};

/**
 * Loads and initializes the official Meta JavaScript SDK
 */
export const initFacebookSdk = (customAppId?: string): Promise<boolean> => {
  const appId = (customAppId || getStoredFacebookAppId()).trim();

  if (isSdkReady && window.FB) {
    try {
      window.FB.init({
        appId,
        cookie: true,
        xfbml: true,
        version: SDK_VERSION,
      });
      return Promise.resolve(true);
    } catch {
      // Ignore if re-inited
    }
  }

  if (sdkInitPromise) return sdkInitPromise;

  sdkInitPromise = new Promise((resolve) => {
    window.fbAsyncInit = function () {
      try {
        window.FB?.init({
          appId,
          cookie: true,
          xfbml: true,
          version: SDK_VERSION,
        });
        window.FB?.AppEvents?.logPageView();
        isSdkReady = true;
        resolve(true);
      } catch (err) {
        console.warn("FB.init error:", err);
        resolve(false);
      }
    };

    if (document.getElementById("facebook-jssdk")) {
      if (window.FB) {
        window.fbAsyncInit();
      }
      return;
    }

    isSdkLoading = true;
    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      console.warn("Failed to load Facebook SDK script");
      resolve(false);
    };
    document.body.appendChild(script);
  });

  return sdkInitPromise;
};

/**
 * Triggers the official Facebook OAuth Login popup and retrieves user pages (/me/accounts)
 */
export const loginAndFetchFacebookPages = async (
  customAppId?: string
): Promise<{
  success: boolean;
  user?: { id: string; name?: string; accessToken: string };
  pages: FacebookPageItem[];
  error?: string;
}> => {
  try {
    await initFacebookSdk(customAppId);

    if (!window.FB) {
      throw new Error("لم يتم تحميل Facebook JavaScript SDK بنجاح. يرجى التحقق من اتصال الإنترنت.");
    }

    return new Promise((resolve) => {
      window.FB!.login(
        (response: FacebookLoginResponse) => {
          if (response.status !== "connected" || !response.authResponse) {
            return resolve({
              success: false,
              pages: [],
              error: "تم إغلاق نافذة تسجيل الدخول أو رفض منح الأذونات المطلوبة.",
            });
          }

          const userAccessToken = response.authResponse.accessToken;
          const userId = response.authResponse.userID;

          // Fetch all Pages user manages
          window.FB!.api(
            "/me/accounts",
            "GET",
            {
              fields: "id,name,category,access_token,tasks,fan_count,picture.type(large),link",
              access_token: userAccessToken,
            },
            (pagesResponse: any) => {
              if (pagesResponse.error) {
                return resolve({
                  success: false,
                  pages: [],
                  error: pagesResponse.error.message || "تعذر جلب صفحات فيسبوك المرتبطة بالحساب.",
                });
              }

              const pagesList: FacebookPageItem[] = pagesResponse.data || [];
              resolve({
                success: true,
                user: { id: userId, accessToken: userAccessToken },
                pages: pagesList,
              });
            }
          );
        },
        {
          scope: "pages_show_list,pages_read_engagement,pages_manage_posts,pages_messaging",
          return_scopes: true,
        }
      );
    });
  } catch (err: any) {
    return {
      success: false,
      pages: [],
      error: err.message || "حدث خطأ غير متوقع أثناء الاتصال بفيسبوك.",
    };
  }
};

/**
 * Real direct test publishing via Server Proxy (keeps access tokens secure)
 */
export const publishDirectToFacebook = async (
  pageId: string,
  pageAccessToken: string,
  message: string,
  imageUrl?: string
): Promise<{
  success: boolean;
  postId?: string;
  postUrl?: string;
  error?: string;
  publishedAt?: string;
}> => {
  try {
    const res = await fetch("/api/facebook/publish-post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pageId: pageId.trim(),
        pageAccessToken: pageAccessToken.trim(),
        message: message.trim(),
        imageUrl: imageUrl?.trim(),
      }),
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "تعذر الاتصال بخادم النشر.",
    };
  }
};
