declare module "simple-icons" {
    export interface SimpleIcon {
        title: string;
        slug: string;
        hex: string;
        source: string;
        svg: string;
        path: string;
        guidelines?: string;
        license?: {
            type: string;
            url: string;
        };
    }

    export const siGoogle: SimpleIcon;
    export const siApple: SimpleIcon;
    export const siMastercard: SimpleIcon;
    export const siGithub: SimpleIcon;
    export const siGitlab: SimpleIcon;
    export const siX: SimpleIcon;
    export const siLinkedin: SimpleIcon;
    export const siFacebook: SimpleIcon;
    export const siMicrosoft: SimpleIcon;
    export const siMeta: SimpleIcon;
    export const siTwitter: SimpleIcon;
    export const siYoutube: SimpleIcon;
    export const siInstagram: SimpleIcon;
    export const siWhatsapp: SimpleIcon;
    export const siPaypal: SimpleIcon;
    export const siVisa: SimpleIcon;
    export const siAmericanexpress: SimpleIcon;

    const icons: Record<string, SimpleIcon>;
    export default icons;
}
