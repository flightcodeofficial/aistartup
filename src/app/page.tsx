import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, Sparkles } from "lucide-react";
import { routes } from "@/lib/routes";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <section className="bg-hero-gradient relative overflow-hidden px-6 py-24 text-white sm:px-12">
        <div className="mx-auto flex max-w-3xl flex-col items-start gap-5">
          <Badge className="border-white/20 bg-white/10 text-white backdrop-blur-sm">
            <Sparkles className="size-3.5" />
            2주차 · AI 기반 고객 확보 &amp; 자동화 마케팅
          </Badge>
          <h1 className="text-4xl leading-tight font-bold sm:text-5xl">
            이론부터 실습, AI 분석, 결과 저장까지
            <br />
            <span className="text-gradient-brand">하나의 웹앱</span>으로 끝낸다
          </h1>
          <p className="max-w-xl text-base text-white/70 sm:text-lg">
            비개발자 예비창업자를 위한 AI Native Learning Platform. STEP을 따라가며
            직접 만든 ICP, 페르소나, 고객여정, 가치제안이 그대로 포트폴리오가
            됩니다.
          </p>
          <Button size="lg" className="mt-2 gap-2" asChild>
            <Link href={routes.dashboard()}>
              수업 시작하기
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-5xl gap-6 px-6 py-16 sm:grid-cols-3 sm:px-12">
        <Card>
          <CardHeader>
            <Badge variant="outline" className="w-fit border-success/30 bg-success/10 text-success">
              근거있음
            </Badge>
            <CardTitle className="mt-2">실제 고객 원문에서 확인됨</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              고객 인터뷰, 리뷰, 문의 기록에 직접 등장한 내용입니다.
            </CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Badge variant="outline" className="w-fit border-warning/30 bg-warning/10 text-warning-foreground">
              추론
            </Badge>
            <CardTitle className="mt-2">합리적으로 유추한 내용</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              원문에 직접 등장하지 않지만 근거를 바탕으로 추론한 내용입니다.
            </CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Badge variant="outline" className="w-fit border-danger/30 bg-danger/10 text-danger">
              검증 필요
            </Badge>
            <CardTitle className="mt-2">AI가 만들었지만 원문엔 없음</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              그럴듯해 보여도 반드시 실제 고객으로 확인해야 하는 내용입니다.
            </CardDescription>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
