import Image from "next/image";
import {getTranslations} from "next-intl/server";

export default async function Footer() {
  const t = await getTranslations();
  return (
    <footer className="footer">
      <div className="container">
       <div className="row mb-3">
         <div className="col-md-4">
           <Image
             src="/images/logo.png"
             alt={t('meta.home.title')}
             width={123} // chỉnh theo kích thước logo thực tế
             height={41}
             priority // load sớm cho SEO/LCP
           />
         </div>
         <div className="col-md-4 hidden-footer">
           <h3 className="footer-title">{t('footer.platform')}</h3>
         </div>
         <div className="col-md-4 hidden-footer">
           <h3 className="footer-title">{t('footer.resources')}</h3>
         </div>
       </div>
        <div className="row footer-info">
          <div className="col-md-4"><p>{t('footer.desc')}</p></div>
          <div className="col-md-4 show-fotter">
            <h3 className="footer-title">{t('footer.platform')}</h3>
          </div>
          <div className="col-md-4">
            <ul>
              <li><a href="/exchanges">{t('footer.exchange_rebates')}</a></li>
              <li><a href="/calculator">{t('footer.profit_calculator')}</a></li>
            </ul>
          </div>
          <div className="col-md-4 show-fotter">
            <h3 className="footer-title">{t('footer.resources')}</h3>
          </div>
          <div className="col-md-4">
            <ul>
              <li><a href="/help-center">{t('footer.help_center')}</a></li>
              <li><a href="/term-of-use">{t('footer.terms_of_use')}</a></li>
            </ul>
          </div>
        </div>
        <div className="row  copyright">
          <div className="col-md-8 text-copyright">
            <p className="mb-0">{t('footer.copyright')}</p>
          </div>

          <div className="col-md-4 text-md-end text-start">
            <p className="mb-2">{t('footer.follow_us')}</p>

            <div className="d-flex justify-content-md-end justify-content-start gap-3">
              <a href="#" aria-label="Facebook">
                <Image src="/images/fb.svg" alt="Facebook" width={48} height={48} />
              </a>
              <a href="#" aria-label="X">
                <Image src="/images/x.svg" alt="X" width={48} height={48} />
              </a>
              <a href="#" aria-label="Instagram">
                <Image src="/images/insta.svg" alt="Instagram" width={48} height={48} />
              </a>
              <a href="#" aria-label="TikTok">
                <Image src="/images/tiktok.svg" alt="TikTok" width={48} height={48} />
              </a>
            </div>
          </div>
        </div>

      </div>
    </footer>
  )
}
