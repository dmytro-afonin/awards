"use client";

import type { Id } from "@cvx/_generated/dataModel";
import type { ComponentType } from "react";
import type { PublicLayoutId } from "@/lib/public-layout";
import {
  ArcadeCampaignPage,
  ArcadeCategoriesPage,
  ArcadeCategoryPage,
} from "./arcade";
import {
  BureauCampaignPage,
  BureauCategoriesPage,
  BureauCategoryPage,
} from "./bureau";
import {
  ClassicCampaignPage,
  ClassicCategoriesPage,
  ClassicCategoryPage,
} from "./classic";
import {
  EditorialCampaignPage,
  EditorialCategoriesPage,
  EditorialCategoryPage,
} from "./editorial";
import {
  FestivalCampaignPage,
  FestivalCategoriesPage,
  FestivalCategoryPage,
} from "./festival";
import { PublicLayoutSwitcher } from "./layout-switcher";
import {
  StadiumCampaignPage,
  StadiumCategoriesPage,
  StadiumCategoryPage,
} from "./stadium";
import {
  StoryCampaignPage,
  StoryCategoriesPage,
  StoryCategoryPage,
} from "./story";
import { ZenCampaignPage, ZenCategoriesPage, ZenCategoryPage } from "./zen";

type SlugProps = { slug: string };
type CategoryProps = SlugProps & {
  categoryId: Id<"campaignCategories">;
};

type LayoutPages = {
  Campaign: ComponentType<SlugProps>;
  Categories: ComponentType<SlugProps>;
  Category: ComponentType<CategoryProps>;
};

const LAYOUT_PAGES: Record<PublicLayoutId, LayoutPages> = {
  classic: {
    Campaign: ClassicCampaignPage,
    Categories: ClassicCategoriesPage,
    Category: ClassicCategoryPage,
  },
  editorial: {
    Campaign: EditorialCampaignPage,
    Categories: EditorialCategoriesPage,
    Category: EditorialCategoryPage,
  },
  arcade: {
    Campaign: ArcadeCampaignPage,
    Categories: ArcadeCategoriesPage,
    Category: ArcadeCategoryPage,
  },
  zen: {
    Campaign: ZenCampaignPage,
    Categories: ZenCategoriesPage,
    Category: ZenCategoryPage,
  },
  stadium: {
    Campaign: StadiumCampaignPage,
    Categories: StadiumCategoriesPage,
    Category: StadiumCategoryPage,
  },
  story: {
    Campaign: StoryCampaignPage,
    Categories: StoryCategoriesPage,
    Category: StoryCategoryPage,
  },
  bureau: {
    Campaign: BureauCampaignPage,
    Categories: BureauCategoriesPage,
    Category: BureauCategoryPage,
  },
  festival: {
    Campaign: FestivalCampaignPage,
    Categories: FestivalCategoriesPage,
    Category: FestivalCategoryPage,
  },
};

export function getLayoutPages(layout: PublicLayoutId): LayoutPages {
  return LAYOUT_PAGES[layout];
}

export function PublicLayoutChrome() {
  return <PublicLayoutSwitcher />;
}
