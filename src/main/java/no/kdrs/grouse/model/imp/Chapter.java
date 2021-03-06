package no.kdrs.grouse.model.imp;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import java.util.ArrayList;
import java.util.List;

@XmlRootElement(name="chapter")
@XmlAccessorType (XmlAccessType.FIELD)
public class Chapter {

    @XmlElement(name = "chapterTitle")
    private String chapterTitle;

    @XmlElement(name = "showMe")
    private Boolean showMe;

    @XmlElement(name = "section")
    private List<Section> sections = new ArrayList<>();

    public String getChapterTitle() {
        return chapterTitle;
    }

    public void setChapterTitle(String chapterTitle) {
        this.chapterTitle = chapterTitle;
    }

    public Boolean getShowMe() {
        return showMe;
    }

    public void setShowMe(Boolean showMe) {
        this.showMe = showMe;
    }

    public List<Section> getSections() {
        return sections;
    }

    public void setSections(List<Section> sections) {
        this.sections = sections;
    }

    @Override
    public String toString() {
        return "Chapter{" +
                "chapterTitle='" + chapterTitle + '\'' +
                ", showMe=" + showMe +
                '}';
    }
}
